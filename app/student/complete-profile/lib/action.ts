"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable, subjectTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";
import {
  completeProfileSchema,
  type CompleteProfileSchema,
} from "./zod-type";

/**
 * Find the admitted student record for the currently authenticated user.
 * Supports both direct email match and UAN-based email format.
 */
async function findStudentBySession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "student") {
    return null;
  }

  const email = session.user.email;

  // Try direct email match first
  let student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, email),
  });

  // Fallback: extract UAN from student email format
  if (!student && email.endsWith("@student.ssdm.local")) {
    const uan = email.split("@")[0].toUpperCase();
    student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, uan),
    });
  }

  return student;
}

/**
 * Fetch the current student's incomplete profile data for pre-filling the form.
 */
export async function fetchIncompleteProfile() {
  try {
    const student = await findStudentBySession();

    if (!student) {
      return { success: false as const, message: "Unauthorized" };
    }

    if (student.isProfileCompleted) {
      return {
        success: false as const,
        message: "Profile is already completed",
      };
    }

    // Fetch active subjects for selection
    const activeSubjects = await db.query.subjectTable.findMany({
      where: eq(subjectTable.isActive, true),
      orderBy: (subjects, { asc }) => [asc(subjects.name)],
    });

    return {
      success: true as const,
      data: {
        id: student.id,
        UAN: student.UAN,
        name: student.name,
        fathersName: student.fathersName,
        collegeRoll: student.collegeRoll,
        registrationNumber: student.registrationNumber,
        universityRoll: student.universityRoll,
        currentSemesterCount: student.currentSemesterCount,
        // Fields the student needs to fill in (may have placeholder values)
        DOB: student.DOB === "2000-01-01" ? "" : student.DOB,
        AadharNumber: (() => {
          const rawUniqueNum = (student.universityRoll || student.UAN).replace(/[^0-9]/g, "");
          const placeholderAadhar = rawUniqueNum.slice(-12).padStart(12, "0");
          return student.AadharNumber === placeholderAadhar || student.AadharNumber === "000000000000"
            ? ""
            : student.AadharNumber;
        })(),
        phone: (() => {
          const rawUniqueNum = (student.universityRoll || student.UAN).replace(/[^0-9]/g, "");
          const placeholderPhone = rawUniqueNum.slice(-10).padStart(10, "0");
          return student.phone === placeholderPhone || student.phone === "0000000000"
            ? ""
            : student.phone;
        })(),
        personalEmail: student.email.endsWith("@student.ssdm.local") ? "" : student.email,
        gender: student.gender || "",
        mothersName: student.mothersName || "",
        religion: student.religion || "",
        caste: student.caste || "",
        reservation: student.reservation,
        isMinority: student.isMinority ?? false,
        ABCID: student.ABCID,
        admissionType: student.admissionType,
        city: student.city || "",
        district: student.district || "",
        state: student.state || "",
        pinCode: student.pinCode === 0 ? "" : String(student.pinCode),
        // Academic Details pre-fills (from jsonb arrays)
        subMIC: (student.subMIC as string[])?.[0] || "",
        subMDC: (student.subMDC as string[])?.[0] || "",
        subAEC: (student.subAEC as string[])?.[0] || "",
        subSEC: (student.subSEC as string[])?.[0] || "",
        subVAC: (student.subVAC as string[])?.[0] || "",
      },
      subjects: activeSubjects.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
      })),
    };
  } catch (error) {
    console.error("[fetchIncompleteProfile] Error:", error);
    return {
      success: false as const,
      message: "Failed to fetch profile data",
    };
  }
}

/**
 * Complete the student's profile with the provided data.
 * This is a one-time operation — once completed, the profile cannot be edited again.
 */
export async function completeStudentProfile(payload: CompleteProfileSchema) {
  const parsed = completeProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Invalid profile data. Please check your inputs.",
    };
  }

  try {
    const student = await findStudentBySession();

    if (!student) {
      return { success: false as const, message: "Unauthorized" };
    }

    if (student.isProfileCompleted) {
      return {
        success: false as const,
        message: "Profile has already been completed. No further edits allowed.",
      };
    }

    const data = parsed.data;
    const oldEmail = student.email;
    const newEmail = data.personalEmail;

    await db.transaction(async (tx) => {
      // 1. Update AdmittedStudentTable
      await tx
        .update(AdmittedStudentTable)
        .set({
          DOB: data.DOB,
          AadharNumber: data.AadharNumber,
          phone: data.phone,
          email: newEmail, // Update email with the new personal email
          gender: data.gender,
          mothersName: data.mothersName,
          religion: data.religion,
          caste: data.caste,
          reservation: data.reservation || null,
          isMinority: data.isMinority,
          ABCID: data.ABCID || null,
          admissionType: (data.admissionType || null) as any,
          city: data.city,
          district: data.district,
          state: data.state,
          pinCode: parseInt(data.pinCode, 10),
          // Academic Details as arrays
          subMIC: [data.subMIC],
          subMDC: [data.subMDC],
          subAEC: [data.subAEC],
          subSEC: [data.subSEC],
          subVAC: [data.subVAC],
          isProfileCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(AdmittedStudentTable.id, student.id));

      // 2. Update auth user table if the email was changed
      if (newEmail !== oldEmail) {
        await tx
          .update(user)
          .set({
            email: newEmail,
            emailVerified: true,
          })
          .where(eq(user.email, oldEmail));
      }
    });

    return {
      success: true as const,
      message: "Profile completed successfully!",
    };
  } catch (error: any) {
    console.error("[completeStudentProfile] Error:", error);

    if (error?.code === "23505") {
      return {
        success: false as const,
        message:
          "A record with this Aadhar number or other unique field already exists. Please verify your details.",
      };
    }

    return {
      success: false as const,
      message: "Something went wrong while saving your profile.",
    };
  }
}
