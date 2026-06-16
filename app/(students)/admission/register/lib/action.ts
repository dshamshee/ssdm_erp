"use server";

import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentPreviousAcademicRecordTable,
  StudentDocumentsTable,
} from "@/lib/db/schema/student";
import {
  subjectTable,
  batchTable,
  courseTable,
} from "@/lib/db/schema/department";
import { user } from "@/lib/db/schema/auth-schema";
import { and, eq, inArray, sql, count } from "drizzle-orm";
import {
  registerStudentSchema,
  type RegisterStudentPayload,
} from "./zod-type/register-student-type";
import { auth } from "@/lib/auth";

/**
 * Generate student password from their name and Aadhar number.
 * Format: first 4 chars of name (lowercase, no spaces) + last 4 digits of Aadhar
 * If name has 3 or fewer characters, use last 5 digits of Aadhar instead.
 * Example: name="Amit Kumar", Aadhar="123456781234" → "amit1234"
 * Example: name="Ram", Aadhar="123456781234" → "ram81234"
 */
function generateStudentPassword(name: string, aadharNumber: string): string {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  if (cleanName.length <= 3) {
    return `${cleanName}${aadharNumber.slice(-5)}`;
  }
  return `${cleanName.slice(0, 4)}${aadharNumber.slice(-4)}`;
}

/**
 * Generate a synthetic email from UAN for better-auth (which requires email).
 * Format: uan@student.ssdm.local
 */
function generateStudentEmail(uan: string): string {
  return `${uan.toLowerCase()}@student.ssdm.local`;
}

/**
 * Silently create a student auth account in the background after registration.
 * This is fire-and-forget — errors are logged but don't affect the registration flow.
 */
async function backgroundSignupStudent({
  name,
  uan,
  aadharNumber,
}: {
  name: string;
  uan: string;
  aadharNumber: string;
}) {
  try {
    const email = generateStudentEmail(uan);
    const password = generateStudentPassword(name, aadharNumber);

    // Check if account already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!existingUser) {
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
          role: "student",
        },
      });
    }
  } catch (error) {
    // Silent failure — don't break registration flow
    console.error("[Background Student Signup] Error:", error);
  }
}

export const fetchEnrolledStudent = async ({
  batch,
  UAN,
  MJC,
}: {
  batch: string;
  UAN: string;
  MJC: string;
}) => {
  try {
    const existingStudent = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN),
    });

    if (existingStudent) {
      return {
        success: false,
        message: "Student already take their admission",
      };
    }

    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(
        eq(EnrolledStudentTable.UAN, UAN),
        eq(EnrolledStudentTable.batchId, batch),
        eq(EnrolledStudentTable.subMJC, MJC),
      ),
      with: {
        subMJC: true,
        batch: {
          with: {
            course: { with: { department: true } },
            academicSession: true,
          },
        },
      },
    });

    if (!student) {
      return { success: false, message: "Student not found" };
    }

    // Populate subMIC, subMDC, subAEC, subSEC, subVAC from subjectTable
    const subMICIds = (student.subMIC || []) as string[];
    const subMDCIds = (student.subMDC || []) as string[];
    const subAECIds = (student.subAEC || []) as string[];
    const subSECIds = (student.subSEC || []) as string[];
    const subVACIds = (student.subVAC || []) as string[];

    const allSubjectIds = Array.from(
      new Set([
        ...subMICIds,
        ...subMDCIds,
        ...subAECIds,
        ...subSECIds,
        ...subVACIds,
      ]),
    ).filter(Boolean);

    let subjects: any[] = [];
    if (allSubjectIds.length > 0) {
      subjects = await db
        .select()
        .from(subjectTable)
        .where(inArray(subjectTable.id, allSubjectIds));
    }

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const populatedStudent = {
      ...student,
      subMIC: subMICIds
        .map((id) => subjectMap.get(id) || { id, name: id })
        .filter(Boolean),
      subMDC: subMDCIds
        .map((id) => subjectMap.get(id) || { id, name: id })
        .filter(Boolean),
      subAEC: subAECIds
        .map((id) => subjectMap.get(id) || { id, name: id })
        .filter(Boolean),
      subSEC: subSECIds
        .map((id) => subjectMap.get(id) || { id, name: id })
        .filter(Boolean),
      subVAC: subVACIds
        .map((id) => subjectMap.get(id) || { id, name: id })
        .filter(Boolean),
    };

    return { success: true, data: populatedStudent };
  } catch (error) {
    console.error("[fetchEnrolledStudent] Error:", error);
    return {
      success: false,
      message: "Internal Server Error during fetching enrolled student",
      error: error,
    };
  }
};

export async function registerStudent(payload: RegisterStudentPayload) {
  const parsed = registerStudentSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid payload: " + parsed.error.message,
    };
  }

  const { personal, academic, documents } = parsed.data;

  try {
    // 1. Duplicate check — prevent double registration
    const existingStudent = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, personal.UAN),
    });
    if (existingStudent) {
      return {
        success: false as const,
        message: "Student with this UAN has already been admitted",
      };
    }

    // 2. Auto-generate collegeRoll:  CourseType prefix + Year (2-digit) + Sequence (4-digit padded)
    //    e.g. UG2026290001
    const batch = await db.query.batchTable.findFirst({
      where: eq(batchTable.id, personal.batch),
      with: { course: true, academicSession: true },
    });

    if (!batch || !batch.course) {
      return {
        success: false as const,
        message: "Invalid batch: could not resolve course information",
      };
    }

    // Extract course type prefix (e.g. "UG" from "UG Regular")
    const courseTypePrefix = batch.course.type.split(" ")[0]; // "UG", "PG"

    // Extract session year from academic session start date or name
    const sessionYear =
      batch.academicSession?.name?.match(/\d{4}/)?.[0] ||
      new Date().getFullYear().toString();

    // Count existing admitted students in this batch for sequential numbering
    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(AdmittedStudentTable)
      .where(eq(AdmittedStudentTable.batchId, personal.batch));

    const sequenceNumber = (existingCount + 1).toString().padStart(4, "0");
    const collegeRoll = `${courseTypePrefix}${sessionYear}${sequenceNumber}`;

    // 3. Transaction: insert admitted student, academic record, and documents atomically
    const data = await db.transaction(async (tx) => {
      // 3a. Insert admitted student
      const [admittedStudent] = await tx
        .insert(AdmittedStudentTable)
        .values({
          UAN: personal.UAN,
          registrationNumber: personal.registrationNumber || null,
          universityRoll: personal.universityRoll || null,
          collegeRoll,
          admissionNumber: personal.admissionNumber || null,
          confidentialNumber: personal.confidentialNumber || null,
          profileNumber: personal.profileNumber || null,
          admissionType: personal.admissionType || "OTHER",
          ABCID: personal.ABCID || null,
          name: personal.name,
          avatar: typeof documents.photo === "string" ? documents.photo : "",
          DOB: personal.DOB,
          AadharNumber: personal.AadharNumber,
          phone: personal.phone,
          email: personal.email,
          gender: personal.gender,
          fathersName: personal.fathersName,
          mothersName: personal.mothersName,
          religion: personal.religion,
          caste: personal.caste,
          reservation: personal.reservation || null,
          isMinority: personal.isMinority,
          batchId: personal.batch,
          currentSemesterCount: personal.currentSemesterCount,
          subMJC: personal.subMJC,
          subMIC: personal.subMIC,
          subMDC: personal.subMDC,
          subAEC: personal.subAEC,
          subSEC: personal.subSEC,
          subVAC: personal.subVAC,
          city: personal.city,
          district: personal.district,
          state: personal.state,
          pinCode: parseInt(personal.pinCode, 10),
          isProfileCompleted: true,
        })
        .returning();

      // 3b. Insert previous academic record
      await tx
        .insert(StudentPreviousAcademicRecordTable)
        .values({
          studentId: admittedStudent.id,
          schoolName: academic.schoolName,
          board: academic.board,
          obtainedMarks: Math.round(academic.obtainedMarks),
          totalMarks: Math.round(academic.totalMarks),
          percentage: Math.round(academic.percentage),
          rollNo: academic.rollNo,
          rollCode: academic.rollCode,
          address: academic.address,
          city: academic.city,
          district: academic.district,
          state: academic.state,
          pinCode: academic.pinCode,
          ugInstituteName: academic.ugInstituteName || null,
          ugUniversityName: academic.ugUniversityName || null,
          ugObtainedMarks:
            academic.ugObtainedMarks != null
              ? Math.round(academic.ugObtainedMarks)
              : null,
          ugTotalMarks:
            academic.ugTotalMarks != null
              ? Math.round(academic.ugTotalMarks)
              : null,
          ugPercentage:
            academic.ugPercentage != null
              ? Math.round(academic.ugPercentage)
              : null,
          ugRollNo: academic.ugRollNo || null,
          ugAddress: academic.ugAddress || null,
          ugCity: academic.ugCity || null,
          ugDistrict: academic.ugDistrict || null,
          ugState: academic.ugState || null,
          ugPinCode: academic.ugPinCode || null,
        });

      // 3c. Insert document URLs
      await tx
        .insert(StudentDocumentsTable)
        .values({
          studentId: admittedStudent.id,
          Aadhar: documents.Aadhar,
          cast: documents.cast || null,
          domicile: documents.domicile || null,
          income: documents.income || null,
          pwd: documents.pwd || null,
          previousLC: documents.previousLC,
          previousMigration: documents.previousMigration,
          previousMarksheet: documents.previousMarksheet,
          photo: documents.photo,
          signature: documents.signature,
        });

      return admittedStudent;
    });

    // 4. Check if any assigned subject has hasPractical = true
    const allSubjectIds = [
      personal.subMJC,
      ...personal.subMIC,
      ...personal.subMDC,
      ...personal.subAEC,
      ...personal.subSEC,
      ...personal.subVAC,
    ].filter(Boolean);

    let hasPractical = false;
    if (allSubjectIds.length > 0) {
      const subjects = await db
        .select({ hasPractical: subjectTable.hasPractical })
        .from(subjectTable)
        .where(inArray(subjectTable.id, allSubjectIds));

      hasPractical = subjects.some((s) => s.hasPractical === true);
    }

    // Fire-and-forget: create auth account in background after successful registration
    backgroundSignupStudent({
      name: personal.name,
      uan: personal.UAN,
      aadharNumber: personal.AadharNumber,
    }).catch((err) =>
      console.error("[Background Student Signup] Unhandled:", err),
    );

    return { success: true as const, data: { ...data, hasPractical } };
  } catch (error: any) {
    console.error("[registerStudent] Error:", error);

    // Handle unique constraint violations gracefully
    if (error?.code === "23505") {
      return {
        success: false as const,
        message:
          "A student record with these unique details already exists (duplicate UAN, email, or Aadhar)",
      };
    }

    return {
      success: false as const,
      message: error?.message || "Failed to register student",
    };
  }
}

export const fetchActiveSubjects = async () => {
  try {
    const subjects = await db.query.subjectTable.findMany({
      where: eq(subjectTable.isActive, true),
      orderBy: (subjects, { asc }) => [asc(subjects.name)],
    });
    return {
      success: true as const,
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    };
  } catch (error) {
    console.error("[fetchActiveSubjects] Error:", error);
    return { success: false as const, message: "Failed to fetch subjects" };
  }
};

