"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { academicSessionTable } from "@/lib/db/schema";
import { getAcademicSessionDetails } from "./session-year";
import {
  type AddAcademicSessionSchema,
  addAcademicSessionSchema,
  type UpdateAcademicSessionSchema,
  updateAcademicSessionSchema,
} from "./zod-type/academic-session-type";

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

export async function getAcademicSessions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const academicSessions = await db.query.academicSessionTable.findMany({
      orderBy: [
        desc(academicSessionTable.updatedAt),
        desc(academicSessionTable.createdAt),
      ],
      with: { batches: { with: { course: { with: { department: true } } } } },
    });

    if (!academicSessions) {
      return { success: false, message: "No academic sessions found" };
    }

    return { success: true, data: academicSessions };
  } catch (error) {
    console.error("[getAcademicSessions] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching academic sessions.",
    };
  }
}

export async function addAcademicSession(input: AddAcademicSessionSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addAcademicSessionSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid academic session details" };
    }

    const sessionDetails = getAcademicSessionDetails(
      parsedInput.data.startYear,
      parsedInput.data.endYear,
    );
    const [academicSession] = await db
      .insert(academicSessionTable)
      .values({ ...sessionDetails })
      .returning();

    return { success: true, data: academicSession };
  } catch (error) {
    console.error("[addAcademicSession] Error:", error);
    return {
      success: false,
      message: "Something went wrong while adding academic session.",
    };
  }
}

export async function updateAcademicSession(
  input: UpdateAcademicSessionSchema,
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateAcademicSessionSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid academic session details" };
    }

    const { id, startYear, endYear } = parsedInput.data;
    const sessionDetails = getAcademicSessionDetails(startYear, endYear);
    const [academicSession] = await db
      .update(academicSessionTable)
      .set({ ...sessionDetails, updatedAt: new Date() })
      .where(eq(academicSessionTable.id, id))
      .returning();

    if (!academicSession) {
      return { success: false, message: "Academic session not found" };
    }

    return { success: true, data: academicSession };
  } catch (error) {
    console.error("[updateAcademicSession] Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating academic session.",
    };
  }
}
