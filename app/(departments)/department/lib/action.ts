"use server";

import { desc, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseTable, departmentTable } from "@/lib/db/schema";
import {
  type AddDepartmentSchema,
  addDepartmentSchema,
} from "./zod-type/add-department-type";

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

// Fetch All Departments
export async function fetchDepartments() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const departments = await db.query.departmentTable.findMany({
      orderBy: [
        desc(departmentTable.updatedAt),
        desc(departmentTable.createdAt),
      ],
    });

    if (!departments) {
      return { success: false, message: "No departments found" };
    }

    return { success: true, data: departments };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error fetching departments",
    };
  }
}

export async function addDepartment(input: AddDepartmentSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addDepartmentSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid department details" };
    }

    const nameValue = parsedInput.data.name.trim();
    const codeValue = parsedInput.data.code?.trim();
    const normalizedCode = codeValue && codeValue.length > 0 ? codeValue : "";
    const descriptionValue = parsedInput.data.description?.trim() ?? "";

    const existingDepartment = await db.query.departmentTable.findFirst({
      where: normalizedCode
        ? or(
            eq(departmentTable.name, nameValue),
            eq(departmentTable.code, normalizedCode),
          )
        : eq(departmentTable.name, nameValue),
    });

    if (existingDepartment) {
      if (existingDepartment.name === nameValue) {
        return {
          success: false,
          message: "A department with this name already exists",
        };
      }
      if (normalizedCode && existingDepartment.code === normalizedCode) {
        return { success: false, message: "Department code already exists" };
      }
    }

    const [department] = await db
      .insert(departmentTable)
      .values({
        name: nameValue,
        code: normalizedCode,
        description: descriptionValue,
      })
      .returning();

    return { success: true, data: department };
  } catch (error: any) {
    if (
      error?.code === "23505" ||
      error?.message?.toLowerCase().includes("unique constraint")
    ) {
      if (
        error?.detail?.toLowerCase().includes("code") ||
        error?.message?.toLowerCase().includes("code")
      ) {
        return { success: false, message: "Department code already exists" };
      }
      if (
        error?.detail?.toLowerCase().includes("name") ||
        error?.message?.toLowerCase().includes("name")
      ) {
        return {
          success: false,
          message: "A department with this name already exists",
        };
      }
    }
    return { success: false, message: "Failed to add department" };
  }
}

// Fetch Courses by Department ID
export async function fetchCoursesByDepartment(departmentId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const courses = await db.query.courseTable.findMany({
      where: eq(courseTable.departmentId, departmentId),
      orderBy: [desc(courseTable.updatedAt), desc(courseTable.createdAt)],
      with: { batches: true },
    });

    return { success: true as const, data: courses };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Error fetching courses for department",
    };
  }
}
