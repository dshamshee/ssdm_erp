import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdmittedStudentTable } from "@/lib/db/schema";
import { user } from "@/lib/db/schema/auth-schema";

// ─── HELPERS ────────────────────────────────────────────────────────────────────

/**
 * Generate a synthetic email from UAN for better-auth (which requires email).
 * Strips ALL non-alphanumeric chars (including invisible Unicode from spreadsheets).
 */
function generateStudentEmail(uan: string): string {
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${cleanUAN}@student.ssdm.local`;
}

/**
 * Generate student password from their name and UAN.
 * Strips ALL non-alpha chars from name (including invisible Unicode).
 * Format: first 4 chars of name (lowercase, alpha-only) + last 4 chars of UAN
 * If name has 3 or fewer alpha characters, use last 5 chars of UAN instead.
 */
function generateStudentPassword(name: string, uan: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const cleanUAN = uan.replace(/[^a-zA-Z0-9]/g, "");
  if (cleanName.length <= 3) {
    return `${cleanName}${cleanUAN.slice(-5)}`;
  }
  return `${cleanName.slice(0, 4)}${cleanUAN.slice(-4)}`;
}

// ─── TYPES ──────────────────────────────────────────────────────────────────────

interface FixResult {
  UAN: string;
  name: string;
  loginEmail: string;
  loginPassword: string;
  action: "created" | "recreated" | "failed";
  error?: string;
}

// ─── POST HANDLER ───────────────────────────────────────────────────────────────

export async function POST() {
  try {
    // 1. Fetch ALL students in semester 7
    const semester7Students = await db
      .select({
        id: AdmittedStudentTable.id,
        UAN: AdmittedStudentTable.UAN,
        name: AdmittedStudentTable.name,
        email: AdmittedStudentTable.email,
      })
      .from(AdmittedStudentTable)
      .where(eq(AdmittedStudentTable.currentSemesterCount, 7));

    if (semester7Students.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No students found in semester 7.",
        total: 0,
        created: 0,
        recreated: 0,
        failed: 0,
        credentials: [],
      });
    }

    console.log(
      `[Fix Semester 7 Auth] Found ${semester7Students.length} students in semester 7`,
    );

    // 2. Process each student
    const results: FixResult[] = [];
    let createdCount = 0;
    let recreatedCount = 0;
    let failedCount = 0;

    for (const student of semester7Students) {
      const cleanEmail = generateStudentEmail(student.UAN);
      const cleanPassword = generateStudentPassword(
        student.name,
        student.UAN,
      );

      try {
        // Check if auth user already exists for this email
        const existingUser = await db.query.user.findFirst({
          where: eq(user.email, cleanEmail),
        });

        if (existingUser) {
          // Delete existing user (cascades to account + session tables)
          await db.delete(user).where(eq(user.id, existingUser.id));
          console.log(
            `[Fix Semester 7 Auth] Deleted existing auth user for ${student.UAN} (${existingUser.id})`,
          );
        }

        // Also check if there's a user with dirty email (containing invisible chars)
        // The student.email from the DB might have the dirty version
        if (student.email !== cleanEmail) {
          const dirtyUser = await db.query.user.findFirst({
            where: eq(user.email, student.email),
          });
          if (dirtyUser) {
            await db.delete(user).where(eq(user.id, dirtyUser.id));
            console.log(
              `[Fix Semester 7 Auth] Deleted dirty-email auth user for ${student.UAN} (${dirtyUser.id})`,
            );
          }
        }

        // Create fresh auth account with clean credentials
        await auth.api.signUpEmail({
          body: {
            name: student.name,
            email: cleanEmail,
            password: cleanPassword,
            role: "student",
          },
        });

        const action = existingUser ? "recreated" : "created";
        if (action === "recreated") recreatedCount++;
        else createdCount++;

        results.push({
          UAN: student.UAN,
          name: student.name,
          loginEmail: cleanEmail,
          loginPassword: cleanPassword,
          action,
        });

        console.log(
          `[Fix Semester 7 Auth] ${action} auth for ${student.UAN} → ${cleanEmail}`,
        );
      } catch (error) {
        failedCount++;
        const errMsg =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[Fix Semester 7 Auth] FAILED for ${student.UAN}:`,
          error,
        );
        results.push({
          UAN: student.UAN,
          name: student.name,
          loginEmail: cleanEmail,
          loginPassword: cleanPassword,
          action: "failed",
          error: errMsg,
        });
      }
    }

    // 3. Also fix the email in AdmittedStudentTable if it has invisible chars
    for (const student of semester7Students) {
      const cleanEmail = generateStudentEmail(student.UAN);
      if (student.email !== cleanEmail) {
        await db
          .update(AdmittedStudentTable)
          .set({ email: cleanEmail })
          .where(eq(AdmittedStudentTable.id, student.id));
        console.log(
          `[Fix Semester 7 Auth] Fixed dirty email in AdmittedStudentTable for ${student.UAN}: "${student.email}" → "${cleanEmail}"`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Semester 7 auth fix complete: ${createdCount} created, ${recreatedCount} recreated, ${failedCount} failed.`,
      total: semester7Students.length,
      created: createdCount,
      recreated: recreatedCount,
      failed: failedCount,
      credentials: results.map((r) => ({
        UAN: r.UAN,
        name: r.name,
        loginEmail: r.loginEmail,
        loginPassword: r.loginPassword,
        status: r.action,
        ...(r.error ? { error: r.error } : {}),
      })),
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Fix Semester 7 Auth] Fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
