import { createId } from "@paralleldrive/cuid2";
import { count, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  batchTable,
  subjectTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Generate a synthetic email from UAN for better-auth (which requires email).
 * Format: uan@student.ssdm.local
 */
function generateStudentEmail(uan: string): string {
  return `${uan.toLowerCase()}@student.ssdm.local`;
}

/**
 * Generate student password from their name and UAN.
 * Format: first 4 chars of name (lowercase, no spaces) + last 4 chars of UAN
 * If name has 3 or fewer characters, use last 5 chars of UAN instead.
 */
function generateStudentPassword(name: string, uan: string): string {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "");
  if (cleanName.length <= 3) {
    return `${cleanName}${cleanUAN.slice(-5)}`;
  }
  return `${cleanName.slice(0, 4)}${cleanUAN.slice(-4)}`;
}

// ─── ZOD SCHEMA ─────────────────────────────────────────────────────────────────

const oldStudentItemSchema = z.object({
  UAN: z.string().min(1, "UAN is required"),
  name: z.string().min(1, "Student name is required"),
  fathersName: z.string().min(1, "Father's name is required"),
  registrationNumber: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  universityRoll: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
  MJC: z.string().min(1, "Major Subject (MJC) is required"),
  semester: z.number().int().min(1, "Semester must be at least 1"),
  batchId: z.string().min(1, "Batch ID is required"),
  admissionType: z
    .enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER", ""])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val || null)),
  gender: z
    .enum(["Male", "Female", "Transgender", ""])
    .optional()
    .nullable()
    .transform((val) => (val === "" ? "Male" : val || "Male")),
  reservation: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val || null),
});

// ─── TYPES ──────────────────────────────────────────────────────────────────────

interface DbError {
  code?: string;
  detail?: string;
  message?: string;
}

interface StudentCredential {
  UAN: string;
  name: string;
  email: string;
  password: string;
  collegeRoll: string;
}

// ─── POST HANDLER ───────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onConflict = searchParams.get("onConflict") || "fail"; // 'fail' | 'ignore'

    if (onConflict !== "fail" && onConflict !== "ignore") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid onConflict parameter. Supported values: 'fail', 'ignore'",
        },
        { status: 400 },
      );
    }

    // 1. Parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    // 2. Normalize to array (accept single object or array)
    const inputArray = Array.isArray(body) ? body : [body];

    if (inputArray.length === 0) {
      return NextResponse.json(
        { success: false, message: "The student list cannot be empty" },
        { status: 400 },
      );
    }

    // 3. Zod Validation
    const parsed = z.array(oldStudentItemSchema).safeParse(inputArray);
    if (!parsed.success) {
      const formattedErrors = parsed.error.issues.map((err) => {
        const index = err.path[0];
        const field = err.path.slice(1).join(".");
        return { index, field, message: err.message };
      });

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for one or more records.",
          errors: formattedErrors,
        },
        { status: 400 },
      );
    }

    const students = parsed.data;

    // 4. FK Validation — check batchId and MJC exist
    const uniqueBatchIds = Array.from(new Set(students.map((s) => s.batchId)));
    const uniqueMjcIds = Array.from(new Set(students.map((s) => s.MJC)));

    const existingBatches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(inArray(batchTable.id, uniqueBatchIds));
    const existingBatchIdsSet = new Set(existingBatches.map((b) => b.id));
    const missingBatchIds = uniqueBatchIds.filter(
      (id) => !existingBatchIdsSet.has(id),
    );

    const existingSubjects = await db
      .select({ id: subjectTable.id })
      .from(subjectTable)
      .where(inArray(subjectTable.id, uniqueMjcIds));
    const existingSubjectIdsSet = new Set(existingSubjects.map((s) => s.id));
    const missingMjcIds = uniqueMjcIds.filter(
      (id) => !existingSubjectIdsSet.has(id),
    );

    if (missingBatchIds.length > 0 || missingMjcIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced database entities do not exist.",
          errors: {
            missingBatchIds:
              missingBatchIds.length > 0 ? missingBatchIds : undefined,
            missingMjcIds: missingMjcIds.length > 0 ? missingMjcIds : undefined,
          },
        },
        { status: 400 },
      );
    }

    // 5. Fetch batch → course mappings for collegeRoll generation & perSemesterFee
    const batchesWithCourse = await db.query.batchTable.findMany({
      where: inArray(batchTable.id, uniqueBatchIds),
      with: { course: true },
    });

    const batchInfoMap = new Map<string, { courseCode: string; perSemesterFee: number }>();
    for (const batch of batchesWithCourse) {
      if (!batch.course) {
        return NextResponse.json(
          {
            success: false,
            message: `Batch ${batch.id} has no associated course. Cannot generate collegeRoll.`,
          },
          { status: 400 },
        );
      }
      batchInfoMap.set(batch.id, {
        courseCode: batch.course.code,
        perSemesterFee: batch.perSemesterFee,
      });
    }

    // 6. Group students by batchId for serial number generation
    const studentsByBatch = new Map<string, typeof students>();
    for (const student of students) {
      const group = studentsByBatch.get(student.batchId) || [];
      group.push(student);
      studentsByBatch.set(student.batchId, group);
    }

    // 7. Database insertion inside transaction to ensure atomic student + fee payment creation
    try {
      const OLD_YEAR = "23"; // Hardcoded year for old students
      const credentials: StudentCredential[] = [];

      if (onConflict === "ignore") {
        const { result, insertedCount, ignoredCount, authResults } = await db.transaction(async (tx) => {
          const allValues = [];

          for (const [batchId, batchStudents] of studentsByBatch) {
            const batchInfo = batchInfoMap.get(batchId)!;

            // Count existing students in this batch
            const [{ studentCount }] = await tx
              .select({ studentCount: count() })
              .from(AdmittedStudentTable)
              .where(eq(AdmittedStudentTable.batchId, batchId));

            for (let i = 0; i < batchStudents.length; i++) {
              const s = batchStudents[i];
              const serialNumber = (studentCount + i + 1)
                .toString()
                .padStart(3, "0");
              const collegeRoll = `${OLD_YEAR}${batchInfo.courseCode}${serialNumber}`;

              const email = generateStudentEmail(s.UAN);
              const password = generateStudentPassword(s.name, s.UAN);

              credentials.push({
                UAN: s.UAN,
                name: s.name,
                email,
                password,
                collegeRoll,
              });

              const rawUniqueNum = (s.universityRoll || s.UAN).replace(/[^0-9]/g, "");
              const placeholderAadhar = rawUniqueNum.slice(-12).padStart(12, "0");
              const placeholderPhone = rawUniqueNum.slice(-10).padStart(10, "0");

              allValues.push({
                id: createId(),
                UAN: s.UAN,
                registrationNumber: s.registrationNumber,
                universityRoll: s.universityRoll,
                collegeRoll,
                admissionNumber: null,
                confidentialNumber: null,
                profileNumber: null,
                admissionType: s.admissionType,
                ABCID: null,
                name: s.name,
                avatar: "",
                DOB: "2000-01-01", // Placeholder — student will update
                AadharNumber: placeholderAadhar,
                phone: placeholderPhone,
                email, // UAN-based email for auth login
                gender: s.gender as any,
                fathersName: s.fathersName,
                mothersName: "", // Placeholder — student will update
                religion: "", // Placeholder — student will update
                caste: "GEN" as const, // Placeholder — student will update
                reservation: s.reservation,
                isMinority: false,
                batchId: s.batchId,
                currentSemesterCount: s.semester,
                subMJC: s.MJC,
                subMIC: [s.MJC], // Same as MJC
                subMDC: [s.MJC], // Same as MJC
                subAEC: [s.MJC], // Same as MJC
                subSEC: [s.MJC], // Same as MJC
                subVAC: [s.MJC], // Same as MJC
                city: "", // Placeholder — student will update
                district: "", // Placeholder — student will update
                state: "", // Placeholder — student will update
                pinCode: 0, // Placeholder — student will update
                isInternshipStarted: false,
                internshipFee: 0,
                isProfileCompleted: false, // Student must complete profile on first login
                isDetained: false,
                isPassed: false,
                isActive: true,
                detainRemark: "",
              });
            }
          }

          const insertedAdmittedStudents = await tx
            .insert(AdmittedStudentTable)
            .values(allValues)
            .onConflictDoNothing()
            .returning({ id: AdmittedStudentTable.id, UAN: AdmittedStudentTable.UAN });

          const insertedCount = insertedAdmittedStudents.length;
          const ignoredCount = allValues.length - insertedCount;

          // Insert successful payment records for successfully inserted students
          // const paymentsToInsert = [];
          // const insertedUanMap = new Map(insertedAdmittedStudents.map((r) => [r.UAN, r.id]));

          // for (const s of students) {
          //   const studentId = insertedUanMap.get(s.UAN);
          //   if (studentId) {
          //     const batchInfo = batchInfoMap.get(s.batchId)!;
          //     paymentsToInsert.push({
          //       id: createId(),
          //       studentId: studentId,
          //       semesterCount: s.semester,
          //       amount: batchInfo.perSemesterFee,
          //       paymentMode: "OFFLINE",
          //       transactionId: `LEGACY_${s.UAN}`,
          //       status: "Success",
          //     });
          //   }
          // }

          // if (paymentsToInsert.length > 0) {
          //   await tx.insert(StudentFeePaymentTable).values(paymentsToInsert);
          // }

          // Create Better Auth user accounts for all inserted students
          const authResults = await createAuthAccounts(credentials);

          return { result: insertedAdmittedStudents, insertedCount, ignoredCount, authResults };
        });

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} old students inserted, ${ignoredCount} conflicts ignored. ${authResults.created} auth accounts created.`,
          insertedCount,
          ignoredCount,
          authAccountsCreated: authResults.created,
          authAccountsSkipped: authResults.skipped,
          credentials: credentials.map((c) => ({
            UAN: c.UAN,
            name: c.name,
            loginEmail: c.email,
            loginPassword: c.password,
            collegeRoll: c.collegeRoll,
          })),
        });
      }

      // 'fail' mode — atomic transaction
      const { result, authResults } = await db.transaction(async (tx) => {
        const allValues = [];

        for (const [batchId, batchStudents] of studentsByBatch) {
          const batchInfo = batchInfoMap.get(batchId)!;

          const [{ studentCount }] = await tx
            .select({ studentCount: count() })
            .from(AdmittedStudentTable)
            .where(eq(AdmittedStudentTable.batchId, batchId));

          for (let i = 0; i < batchStudents.length; i++) {
            const s = batchStudents[i];
            const serialNumber = (studentCount + i + 1)
              .toString()
              .padStart(3, "0");
            const collegeRoll = `${OLD_YEAR}${batchInfo.courseCode}${serialNumber}`;

            const email = generateStudentEmail(s.UAN);
            const password = generateStudentPassword(s.name, s.UAN);

            credentials.push({
              UAN: s.UAN,
              name: s.name,
              email,
              password,
              collegeRoll,
            });

            const rawUniqueNum = (s.universityRoll || s.UAN).replace(/[^0-9]/g, "");
            const placeholderAadhar = rawUniqueNum.slice(-12).padStart(12, "0");
            const placeholderPhone = rawUniqueNum.slice(-10).padStart(10, "0");

            allValues.push({
              id: createId(),
              UAN: s.UAN,
              registrationNumber: s.registrationNumber,
              universityRoll: s.universityRoll,
              collegeRoll,
              admissionNumber: null,
              confidentialNumber: null,
              profileNumber: null,
              admissionType: s.admissionType,
              ABCID: null,
              name: s.name,
              avatar: "",
              DOB: "2000-01-01",
              AadharNumber: placeholderAadhar,
              phone: placeholderPhone,
              email,
              gender: s.gender as any,
              fathersName: s.fathersName,
              mothersName: "",
              religion: "",
              caste: "GEN" as const,
              reservation: s.reservation,
              isMinority: false,
              batchId: s.batchId,
              currentSemesterCount: s.semester,
              subMJC: s.MJC,
              subMIC: [s.MJC],
              subMDC: [s.MJC],
              subAEC: [s.MJC],
              subSEC: [s.MJC],
              subVAC: [s.MJC],
              city: "",
              district: "",
              state: "",
              pinCode: 0,
              isInternshipStarted: false,
              internshipFee: 0,
              isProfileCompleted: false,
              isDetained: false,
              isPassed: false,
              isActive: true,
              detainRemark: "",
            });
          }
        }

        const insertedAdmittedStudents = await tx
          .insert(AdmittedStudentTable)
          .values(allValues)
          .returning({ id: AdmittedStudentTable.id, UAN: AdmittedStudentTable.UAN });

        // Insert successful payment records for all inserted students
        // const paymentsToInsert = [];
        // const insertedUanMap = new Map(insertedAdmittedStudents.map((r) => [r.UAN, r.id]));

        // for (const s of students) {
        //   const studentId = insertedUanMap.get(s.UAN);
        //   if (studentId) {
        //     const batchInfo = batchInfoMap.get(s.batchId)!;
        //     paymentsToInsert.push({
        //       id: createId(),
        //       studentId: studentId,
        //       semesterCount: s.semester,
        //       amount: batchInfo.perSemesterFee,
        //       paymentMode: "OFFLINE",
        //       transactionId: `LEGACY_${s.UAN}`,
        //       status: "Success",
        //     });
        //   }
        // }

        // if (paymentsToInsert.length > 0) {
        //   await tx.insert(StudentFeePaymentTable).values(paymentsToInsert);
        // }

        // Create Better Auth user accounts after successful DB insert
        const authResults = await createAuthAccounts(credentials);

        return { result: insertedAdmittedStudents, authResults };
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} old students. ${authResults.created} auth accounts created.`,
        count: result.length,
        authAccountsCreated: authResults.created,
        authAccountsSkipped: authResults.skipped,
        credentials: credentials.map((c) => ({
          UAN: c.UAN,
          name: c.name,
          loginEmail: c.email,
          loginPassword: c.password,
          collegeRoll: c.collegeRoll,
        })),
      });
    } catch (dbErr) {
      const dbError = ((dbErr as any).cause || dbErr) as DbError;
      console.error("[Insert Old Students DB Error]:", dbError);

      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists.",
            detail:
              dbError.detail ||
              "Unique constraint violation (UAN, collegeRoll, email, AadharNumber, etc.).",
          },
          { status: 409 },
        );
      }

      if (dbError.code === "23514") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A check constraint was violated.",
            detail:
              dbError.message ||
              "Invalid enum value for gender, admissionType, or caste.",
          },
          { status: 400 },
        );
      }

      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A foreign key constraint was violated.",
            detail:
              dbError.detail ||
              "batchId or subMJC references a non-existent entity.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error during database insertion",
          error: dbError.message || String(dbError),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("[Insert Old Students API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

// ─── AUTH ACCOUNT CREATION ──────────────────────────────────────────────────────

async function createAuthAccounts(
  credentials: StudentCredential[],
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (const cred of credentials) {
    try {
      // Check if account already exists
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, cred.email),
      });

      if (existingUser) {
        skipped++;
        continue;
      }

      await auth.api.signUpEmail({
        body: {
          name: cred.name,
          email: cred.email,
          password: cred.password,
          role: "student",
        },
      });
      created++;
    } catch (error) {
      console.error(
        `[Auth Account Creation] Failed for ${cred.UAN}:`,
        error,
      );
      skipped++;
    }
  }

  return { created, skipped };
}
