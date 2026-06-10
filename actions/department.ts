"use server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { courseTable, departmentTable, subjectTable } from "@/lib/db/schema";
import type { ReturnType } from "@/types/return";

export async function fetchSubjectById(subjectId: string): Promise<ReturnType> {
  try {
    const subject = await db.query.subjectTable.findFirst({
      where: and(
        eq(subjectTable.id, subjectId),
        eq(subjectTable.isActive, true),
      ),
    });
    if (!subject) {
      return {
        success: false,
        message: "Subject not found",
        data: null,
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: "Subject fetched successfully",
      data: subject,
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching subject",
      error: error,
      statusCode: 500,
    };
  }
}
