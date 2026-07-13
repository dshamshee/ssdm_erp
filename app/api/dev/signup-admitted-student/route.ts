import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Better Auth requires an email to create a user account.
 * Since students don't have real emails, we create a fake one from their UAN.
 *
 * Steps:
 *   1. Strip all non-alphanumeric chars from UAN (handles invisible Unicode from spreadsheet paste)
 *   2. Lowercase the cleaned UAN
 *   3. Append "@student.ssdm.local" to make it a valid email format
 *
 * Example: UAN "AB/2023/1234" → "ab20231234@student.ssdm.local"
 */
function generateStudentEmail(uan: string): string {
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${cleanUAN}@student.ssdm.local`;
}

/**
 * Generate the default login password for a student.
 *
 * Formula: first 4 letters of name (lowercase, spaces/symbols removed) + last 4 digits of UAN
 *
 * Edge case: If the student's name has 3 or fewer alphabetic characters,
 * we take last 5 digits of UAN instead to keep the password long enough.
 *
 * Example:
 *   name = "Rahul Kumar", UAN = "AB/2023/1234"
 *   cleanName = "rahulkumar" → first 4 = "rahu"
 *   cleanUAN  = "AB20231234"  → last 4  = "1234"
 *   password  = "rahu1234"
 */
function generateStudentPassword(name: string, uan: string): string {
  // Strip everything except A-Z/a-z, then lowercase
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  // Strip everything except alphanumeric
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "");
  if (cleanName.length <= 3) {
    return `${cleanName}${cleanUAN.slice(-5)}`;
  }
  return `${cleanName.slice(0, 4)}${cleanUAN.slice(-4)}`;
}

// ─── ZOD SCHEMA ─────────────────────────────────────────────────────────────────

/**
 * Request body validation for the bulk signup endpoint.
 *
 * Expected JSON payload: an array of objects, each containing:
 *   {
 *     "UAN": "AB/2023/1234",
 *     "session": "2023-2027",
 *     "semesterCount": 5
 *   }
 */
const signupStudentItemSchema = z.object({
  UAN: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^a-zA-Z0-9]/g, "")) // strip invisible chars from copy-paste
    .pipe(z.string().min(1, "UAN is required")),
  session: z
    .string()
    .trim()
    .min(1, "Session is required (e.g. 2023-2027)"),
  semesterCount: z
    .number()
    .int()
    .min(1, "Semester count must be at least 1"),
});

const signupAdmittedStudentsSchema = z.array(signupStudentItemSchema).min(1, "At least one student is required");

// ─── POST HANDLER ───────────────────────────────────────────────────────────────

/**
 * POST /api/dev/signup-admitted-student
 *
 * Creates Better Auth login accounts for multiple admitted students.
 *
 * Flow (per student):
 *   1. Find the student in AdmittedStudentTable by UAN
 *   2. Update the student's current semester count
 *   3. Generate login credentials (synthetic email + password)
 *   4. Skip if auth account already exists
 *   5. Create the Better Auth user account with role "student"
 *   6. Collect results (created / skipped)
 */
export async function POST(req: Request) {
  try {
    // 1. Parse the raw JSON body from the request
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    // 2. Validate the payload against our Zod schema (array of students)
    const parsed = signupAdmittedStudentsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    const students = parsed.data;
    const created: Array<{
      UAN: string;
      name: string;
      session: string;
      semesterCount: number;
      loginEmail: string;
      loginPassword: string;
    }> = [];
    const skipped: Array<{ UAN: string; reason: string }> = [];

    // 3. Process each student
    for (const { UAN, session, semesterCount } of students) {
      // Look up the student in AdmittedStudentTable
      const student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.UAN, UAN),
      });

      if (!student) {
        skipped.push({ UAN, reason: "No admitted student found" });
        continue;
      }

      // Update semester count
      await db
        .update(AdmittedStudentTable)
        .set({ currentSemesterCount: semesterCount })
        .where(eq(AdmittedStudentTable.id, student.id));

      // Generate credentials
      const email = generateStudentEmail(UAN);
      const password = generateStudentPassword(student.name, UAN);

      // Check for existing auth account
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser) {
        skipped.push({ UAN, reason: `Auth already exists (${email})` });
        continue;
      }

      // Create Better Auth account
      try {
        await auth.api.signUpEmail({
          body: { name: student.name, email, password, role: "student" },
        });

        console.log(`[Bulk Signup] Created auth for ${UAN} → ${email}`);

        created.push({
          UAN,
          name: student.name,
          session,
          semesterCount,
          loginEmail: email,
          loginPassword: password,
        });
      } catch (signupErr) {
        const msg = signupErr instanceof Error ? signupErr.message : "Unknown signup error";
        skipped.push({ UAN, reason: msg });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created.length} accounts, skipped ${skipped.length}`,
      created,
      skipped,
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Bulk Signup Admitted Student] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
