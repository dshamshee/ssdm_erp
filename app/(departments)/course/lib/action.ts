"use server";

import { desc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  batchTable,
  courseTable,
  departmentTable,
  semesterTable,
} from "@/lib/db/schema";
import {
  type AddCourseSchema,
  addCourseSchema,
} from "./zod-type/add-course-type";
import { buildSemesterLabels } from "./semester";

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false as const,
      message: "Unauthorized",
    };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return {
      success: false as const,
      message: "Forbidden",
    };
  }

  return {
    success: true as const,
    data: session,
  };
}

export async function fetchAllCourses() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const courses = await db.query.courseTable.findMany({
      orderBy: [
        desc(courseTable.updatedAt),
        desc(courseTable.createdAt),
      ],
      with: {
        department: true,
      },
    });

    if (!courses) {
      return {
        success: false,
        message: "No courses found",
      };
    }

    return {
      success: true,
      data: courses,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error fetching courses",
    };
  }
}

export async function addCourseWithSession(input: AddCourseSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addCourseSchema.safeParse(input);
    if (!parsedInput.success) {
      return {
        success: false,
        message: "Invalid course details",
      };
    }

    const existingCourse = await db.query.courseTable.findFirst({
      where: or(
        eq(courseTable.name, parsedInput.data.name),
        eq(courseTable.code, parsedInput.data.code),
      ),
    });

    if (existingCourse) {
      if (existingCourse.name === parsedInput.data.name) {
        return {
          success: false,
          message: "Course name already exists",
        };
      }
      return {
        success: false,
        message: "Course code already exists",
      };
    }

    const department = await db.query.departmentTable.findFirst({
      where: eq(departmentTable.id, parsedInput.data.departmentId),
    });

    if (!department) {
      return {
        success: false,
        message: "Department not found",
      };
    }

    const academicSession = await db.query.academicSessionTable.findFirst({
      where: eq(academicSessionTable.id, parsedInput.data.sessionId),
    });

    if (!academicSession) {
      return {
        success: false,
        message: "Academic session not found",
      };
    }

    const semesterLabels = buildSemesterLabels(parsedInput.data.duration);
    if (!semesterLabels.length) {
      return {
        success: false,
        message: "Unable to generate semesters for this duration",
      };
    }

    const result = await db.transaction(async (tx) => {
      const [course] = await tx
        .insert(courseTable)
        .values({
          name: parsedInput.data.name,
          code: parsedInput.data.code,
          type: parsedInput.data.type,
          description: parsedInput.data.description,
          departmentId: parsedInput.data.departmentId,
          duration: parsedInput.data.duration,
          isActive: true,
        })
        .returning();

      const [batch] = await tx
        .insert(batchTable)
        .values({
          courseId: course.id,
          sessionId: parsedInput.data.sessionId,
        })
        .returning();

      await tx.insert(semesterTable).values(
        semesterLabels.map((label, index) => ({
          batchId: batch.id,
          name: label,
          semesterNumber: index + 1,
        })),
      );

      return {
        course,
        batch,
        semesterCount: semesterLabels.length,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to add course",
    };
  }
}