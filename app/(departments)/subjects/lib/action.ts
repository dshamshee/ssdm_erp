"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subjectTable } from "@/lib/db/schema";
import {
  type AddSubjectSchema,
  addSubjectSchema,
  type UpdateSubjectSchema,
  updateSubjectSchema,
} from "./zod-type/subject-type";

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

export async function getSubjects() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const subjects = await db.query.subjectTable.findMany({
      orderBy: [desc(subjectTable.updatedAt), desc(subjectTable.createdAt)],
    });

    return { success: true, data: subjects };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch subjects",
    };
  }
}

export async function addSubject(input: AddSubjectSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addSubjectSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid subject details" };
    }

    const [subject] = await db
      .insert(subjectTable)
      .values({
        name: parsedInput.data.name,
        code: parsedInput.data.code,
        category: parsedInput.data.category,
        hasPractical: parsedInput.data.hasPractical,
        isActive: true,
      })
      .returning();

    return { success: true, data: subject };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add subject",
    };
  }
}

export async function updateSubject(input: UpdateSubjectSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateSubjectSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid subject details" };
    }

    const { id, name, code, category, hasPractical, isActive } =
      parsedInput.data;

    const [subject] = await db
      .update(subjectTable)
      .set({
        name,
        code,
        category,
        hasPractical,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(subjectTable.id, id))
      .returning();

    if (!subject) {
      return { success: false, message: "Subject not found" };
    }

    return { success: true, data: subject };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update subject",
    };
  }
}
