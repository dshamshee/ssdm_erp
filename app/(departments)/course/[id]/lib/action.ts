"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { batchTable, courseTable } from "@/lib/db/schema";
import { type AddBatchSchema, addBatchSchema } from "./zod-type/add-batch-type";

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

// Fetch a single course with its department
export async function fetchCourseById(courseId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const course = await db.query.courseTable.findFirst({
      where: eq(courseTable.id, courseId),
      with: { department: true },
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    return { success: true, data: course };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error fetching course",
    };
  }
}

// Fetch all batches for a course with academic session info
export async function fetchBatchesByCourse(courseId: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const batches = await db.query.batchTable.findMany({
      where: eq(batchTable.courseId, courseId),
      orderBy: [desc(batchTable.updatedAt), desc(batchTable.createdAt)],
      with: { academicSession: true },
    });

    return { success: true, data: batches };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error fetching batches",
    };
  }
}

// Add a new Batch
export async function addBatch(input: AddBatchSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addBatchSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid batch details" };
    }

    const { courseId, academicSessionId, perSemesterFee } = parsedInput.data;

    // Check if a batch already exists for this course + session combination
    const existingBatch = await db.query.batchTable.findFirst({
      where: and(
        eq(batchTable.courseId, courseId),
        eq(batchTable.academicSessionId, academicSessionId),
      ),
    });

    if (existingBatch) {
      return {
        success: false,
        message: "A batch already exists for this course and academic session",
      };
    }

    const [batch] = await db
      .insert(batchTable)
      .values({ courseId, academicSessionId, perSemesterFee, isActive: true })
      .returning();

    return { success: true, data: batch };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to add batch",
    };
  }
}
