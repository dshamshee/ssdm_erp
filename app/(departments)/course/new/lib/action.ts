"use server";

import { asc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  batchTable,
  courseTable,
  feeTable,
  semesterSubjectTable,
  semesterTable,
} from "@/lib/db/schema";
import { buildSemesterLabels } from "@/app/(departments)/course/lib/semester";
import type { CreateCourseWizardSchema } from "./zod-type/create-course-wizard-type";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, message: "Unauthorized" };
  if (session.user.role !== "admin" && session.user.role !== "superAdmin")
    return { success: false as const, message: "Forbidden" };
  return { success: true as const, data: session };
}

export async function createCourseWizard(input: CreateCourseWizardSchema) {
  try {
    const sessionCheck = await getAdminSession();
    if (!sessionCheck.success) return sessionCheck;

    const { identity, session, subjects, fees } = input;

    // ── Resolve course ─────────────────────────────────────────────────────
    let courseId: string;
    let duration: number;

    if (identity.mode === "existing") {
      const existing = await db.query.courseTable.findFirst({
        where: eq(courseTable.id, identity.courseId),
      });
      if (!existing)
        return { success: false as const, message: "Course not found" };
      courseId = existing.id;
      duration = existing.duration;
    } else {
      // Check uniqueness
      const duplicate = await db.query.courseTable.findFirst({
        where: or(
          eq(courseTable.name, identity.name),
          eq(courseTable.code, identity.code),
        ),
      });
      if (duplicate) {
        const field = duplicate.name === identity.name ? "name" : "code";
        return {
          success: false as const,
          message: `Course ${field} already exists`,
        };
      }

      const [newCourse] = await db
        .insert(courseTable)
        .values({
          name: identity.name,
          code: identity.code,
          type: identity.type,
          description: identity.description,
          departmentId: identity.departmentId,
          duration: identity.duration,
          isActive: true,
        })
        .returning();

      courseId = newCourse.id;
      duration = newCourse.duration;
    }

    const semesterLabels = buildSemesterLabels(duration);
    if (!semesterLabels.length)
      return {
        success: false as const,
        message: "Unable to generate semesters",
      };

    // ── Create batch + semesters in a transaction ──────────────────────────
    const result = await db.transaction(async (tx) => {
      const [batch] = await tx
        .insert(batchTable)
        .values({ courseId, sessionId: session.sessionId })
        .returning();

      const semesters = await tx
        .insert(semesterTable)
        .values(
          semesterLabels.map((label, idx) => ({
            batchId: batch.id,
            name: label,
            semesterNumber: idx + 1,
          })),
        )
        .returning();

      // ── Subjects ────────────────────────────────────────────────────────
      const allSubjectRows: { semesterId: string; subjectId: string }[] = [];

      for (let i = 0; i < semesters.length; i++) {
        const key = subjects.sameForAll ? "0" : String(i);
        const subjectIds = subjects.assignments[key] ?? [];
        for (const subjectId of subjectIds) {
          allSubjectRows.push({ semesterId: semesters[i].id, subjectId });
        }
      }

      if (allSubjectRows.length > 0) {
        await tx.insert(semesterSubjectTable).values(allSubjectRows);
      }

      // ── Fees ────────────────────────────────────────────────────────────
      const feeRows: {
        semesterId: string;
        institution: number;
        university: number;
        practical: number;
        cultural: number;
        sports: number;
        miscellaneous: number;
        late: number;
      }[] = [];

      for (let i = 0; i < semesters.length; i++) {
        const key = fees.sameForAll ? "0" : String(i);
        const f = fees.fees[key];
        if (f) {
          feeRows.push({
            semesterId: semesters[i].id,
            institution: f.institution,
            university: f.university,
            practical: f.practical,
            cultural: f.cultural,
            sports: f.sports,
            miscellaneous: f.miscellaneous,
            late: f.late,
          });
        }
      }

      if (feeRows.length > 0) {
        await tx.insert(feeTable).values(feeRows);
      }

      return { batch, semesters, courseId };
    });

    return { success: true as const, data: result };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to create course",
    };
  }
}
