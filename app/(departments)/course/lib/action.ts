"use server";

import { desc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseTable } from "@/lib/db/schema";
import {
  type AddCourseSchema,
  addCourseSchema,
} from "./zod-type/add-course-type";

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

// Fetch All Courses with department info
export async function fetchCourses() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const courses = await db.query.courseTable.findMany({
      orderBy: [desc(courseTable.updatedAt), desc(courseTable.createdAt)],
      with: { department: true },
    });

    return { success: true, data: courses };
  } catch (error) {
    console.error("[fetchCourses] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching courses.",
    };
  }
}

// Add a new Course
export async function addCourse(input: AddCourseSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addCourseSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid course details" };
    }

    const { name, code, type, description, departmentId, duration } =
      parsedInput.data;

    const nameValue = name.trim();
    const codeValue = code.trim();
    const descriptionValue = description?.trim() ?? "";

    // Check for existing course with same name or code
    const existingCourse = await db.query.courseTable.findFirst({
      where: or(
        eq(courseTable.name, nameValue),
        eq(courseTable.code, codeValue),
      ),
    });

    if (existingCourse) {
      if (existingCourse.name === nameValue) {
        return {
          success: false,
          message: "A course with this name already exists",
        };
      }
      if (existingCourse.code === codeValue) {
        return { success: false, message: "Course code already exists" };
      }
    }

    const [course] = await db
      .insert(courseTable)
      .values({
        name: nameValue,
        code: codeValue,
        type,
        description: descriptionValue,
        departmentId,
        duration,
        isActive: true,
      })
      .returning();

    return { success: true, data: course };
  } catch (error: any) {
    if (
      error?.code === "23505" ||
      error?.message?.toLowerCase().includes("unique constraint")
    ) {
      if (
        error?.detail?.toLowerCase().includes("code") ||
        error?.message?.toLowerCase().includes("code")
      ) {
        return { success: false, message: "Course code already exists" };
      }
      if (
        error?.detail?.toLowerCase().includes("name") ||
        error?.message?.toLowerCase().includes("name")
      ) {
        return {
          success: false,
          message: "A course with this name already exists",
        };
      }
    }
    return { success: false, message: "Failed to add course" };
  }
}
