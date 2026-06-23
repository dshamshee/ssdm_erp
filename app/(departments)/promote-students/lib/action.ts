"use server";

import { and, eq, inArray, sql, or, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  batchTable,
  courseTable,
  academicSessionTable,
  departmentTable,
} from "@/lib/db/schema";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }

  return { success: true as const, data: session };
}

/**
 * Fetch all admitted students filtered by academic session ID.
 * Returns students with their batch → course → department info.
 */
export async function getAdmittedStudentsBySession(sessionId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    if (!sessionId || sessionId.trim() === "") {
      return { success: false, message: "Session ID is required" };
    }

    // Get all batch IDs for this session
    const batchesInSession = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(eq(batchTable.academicSessionId, sessionId));

    if (batchesInSession.length === 0) {
      return { success: true, data: [] };
    }

    const batchIds = batchesInSession.map((b) => b.id);

    // Fetch students in those batches with relational data
    const students = await db.query.AdmittedStudentTable.findMany({
      where: inArray(AdmittedStudentTable.batchId, batchIds),
      with: {
        batch: {
          with: {
            course: {
              with: {
                department: true,
              },
            },
            academicSession: true,
          },
        },
      },
      columns: {
        id: true,
        UAN: true,
        collegeRoll: true,
        name: true,
        gender: true,
        email: true,
        phone: true,
        currentSemesterCount: true,
        isActive: true,
        isDetained: true,
        isPassed: true,
        batchId: true,
      },
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("[getAdmittedStudentsBySession] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching students.",
    };
  }
}

/**
 * Promote all eligible students in a session to the next semester.
 * Eligible = isActive: true, isDetained: false, isPassed: false,
 * and currentSemesterCount < course.duration * 2
 */
export async function promoteStudentsBySession(sessionId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    if (!sessionId || sessionId.trim() === "") {
      return { success: false, message: "Session ID is required" };
    }

    // Get all batches for this session with course duration info
    const batchesInSession = await db.query.batchTable.findMany({
      where: eq(batchTable.academicSessionId, sessionId),
      with: {
        course: true,
      },
    });

    if (batchesInSession.length === 0) {
      return { success: false, message: "No batches found for this session" };
    }

    let totalPromoted = 0;

    // Process each batch separately (different courses may have different durations)
    for (const batch of batchesInSession) {
      const maxSemester = batch.course.duration * 2;

      const result = await db
        .update(AdmittedStudentTable)
        .set({
          currentSemesterCount: sql`${AdmittedStudentTable.currentSemesterCount} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(AdmittedStudentTable.batchId, batch.id),
            eq(AdmittedStudentTable.isActive, true),
            eq(AdmittedStudentTable.isDetained, false),
            eq(AdmittedStudentTable.isPassed, false),
            sql`${AdmittedStudentTable.currentSemesterCount} < ${maxSemester}`,
          ),
        )
        .returning({ id: AdmittedStudentTable.id });

      totalPromoted += result.length;
    }

    return {
      success: true,
      data: { promotedCount: totalPromoted },
    };
  } catch (error) {
    console.error("[promoteStudentsBySession] Error:", error);
    return {
      success: false,
      message: "Something went wrong while promoting students.",
    };
  }
}

/**
 * Search and filter admitted student records based on academic or personal details.
 */
export async function searchAdmittedStudents(filters: {
  query?: string;
  sessionId?: string;
  courseId?: string;
  departmentId?: string;
  semesterCount?: number;
  status?: string;
}) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    const conditions = [];

    if (filters.sessionId || filters.courseId || filters.departmentId) {
      const batchConditions = [];
      if (filters.sessionId && filters.sessionId !== "") {
        batchConditions.push(eq(batchTable.academicSessionId, filters.sessionId));
      }
      if (filters.courseId && filters.courseId !== "") {
        batchConditions.push(eq(batchTable.courseId, filters.courseId));
      }
      if (filters.departmentId && filters.departmentId !== "") {
        batchConditions.push(eq(courseTable.departmentId, filters.departmentId));
      }

      const batches = await db
        .select({ id: batchTable.id })
        .from(batchTable)
        .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
        .where(and(...batchConditions));

      const batchIds = batches.map((b) => b.id);
      if (batchIds.length > 0) {
        conditions.push(inArray(AdmittedStudentTable.batchId, batchIds));
      } else {
        return { success: true, data: [] };
      }
    }

    if (filters.semesterCount) {
      conditions.push(eq(AdmittedStudentTable.currentSemesterCount, filters.semesterCount));
    }

    if (filters.status && filters.status !== "") {
      if (filters.status === "active") {
        conditions.push(eq(AdmittedStudentTable.isActive, true));
      } else if (filters.status === "detained") {
        conditions.push(eq(AdmittedStudentTable.isDetained, true));
      } else if (filters.status === "passed") {
        conditions.push(eq(AdmittedStudentTable.isPassed, true));
      } else if (filters.status === "inactive") {
        conditions.push(eq(AdmittedStudentTable.isActive, false));
      }
    }

    if (filters.query && filters.query.trim() !== "") {
      const q = `%${filters.query.trim()}%`;
      conditions.push(
        or(
          ilike(AdmittedStudentTable.name, q),
          ilike(AdmittedStudentTable.collegeRoll, q),
          ilike(AdmittedStudentTable.email, q),
          ilike(AdmittedStudentTable.phone, q),
          ilike(AdmittedStudentTable.UAN, q),
          ilike(AdmittedStudentTable.universityRoll, q)
        )
      );
    }

    // Query admitted students with relational info
    const students = await db.query.AdmittedStudentTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        batch: {
          with: {
            course: {
              with: {
                department: true,
              },
            },
            academicSession: true,
          },
        },
      },
      columns: {
        id: true,
        UAN: true,
        collegeRoll: true,
        name: true,
        gender: true,
        email: true,
        phone: true,
        currentSemesterCount: true,
        isActive: true,
        isDetained: true,
        isPassed: true,
        batchId: true,
      },
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("[searchAdmittedStudents] Error:", error);
    return {
      success: false,
      message: "Something went wrong while searching students.",
    };
  }
}

/**
 * Promote selected eligible students (semester >= 6, not passed) to Passed status.
 */
export async function promoteStudentsToPassed(studentIds: string[]) {
  try {
    const session = await getAdminSession();
    if (!session.success) return session;

    if (!studentIds || studentIds.length === 0) {
      return { success: false, message: "No student IDs provided" };
    }

    // Fetch the students to verify eligibility
    const eligibleStudents = await db.query.AdmittedStudentTable.findMany({
      where: and(
        inArray(AdmittedStudentTable.id, studentIds),
        sql`${AdmittedStudentTable.currentSemesterCount} >= 6`,
        eq(AdmittedStudentTable.isPassed, false)
      ),
      columns: {
        id: true,
      }
    });

    const eligibleIds = eligibleStudents.map((s) => s.id);

    if (eligibleIds.length === 0) {
      return {
        success: false,
        message: "None of the selected students are eligible for Passed status (must be Semester 6 or higher and not already passed).",
      };
    }

    // Update students to passed and inactive
    await db
      .update(AdmittedStudentTable)
      .set({
        isPassed: true,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(inArray(AdmittedStudentTable.id, eligibleIds));

    return {
      success: true,
      message: `Successfully promoted ${eligibleIds.length} student${eligibleIds.length !== 1 ? "s" : ""} to Passed status.`,
      data: { promotedCount: eligibleIds.length },
    };
  } catch (error) {
    console.error("[promoteStudentsToPassed] Error:", error);
    return {
      success: false,
      message: "Something went wrong while promoting students to Passed.",
    };
  }
}
