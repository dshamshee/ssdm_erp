"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  batchTable,
  courseTable,
  academicSessionTable,
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
    let totalSkipped = 0;

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
