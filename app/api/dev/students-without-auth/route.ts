import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/dev/students-without-auth
 *
 * Returns all admitted students who do NOT have a Better Auth user account.
 *
 * Logic:
 *   - For each admitted student, the synthetic email is:
 *     lower(regexp_replace(UAN, '[^a-zA-Z0-9]', '', 'g')) || '@student.ssdm.local'
 *   - If that email does NOT exist in the "user" table, the student has no auth.
 *
 * Response fields per student: UAN, name, session (from batch → academic_session), semesterCount
 */
export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        s."UAN",
        s."name",
        s."currentSemesterCount" AS "semesterCount",
        acs."name"               AS "session"
      FROM "admitted_students" s
      JOIN "batch" b      ON b."id" = s."batchId"
      JOIN "academic_session" acs ON acs."id" = b."academicSessionId"
      WHERE NOT EXISTS (
        SELECT 1
        FROM "user" u
        WHERE u."email" = lower(regexp_replace(s."UAN", '[^a-zA-Z0-9]', '', 'g')) || '@student.ssdm.local'
      )
      ORDER BY acs."name", s."UAN"
    `);

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    const err = error as Error;
    console.error("[Students Without Auth] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
