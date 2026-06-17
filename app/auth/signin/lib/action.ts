"use server";

import { db } from "@/lib/db";
import { EnrolledStudentTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Look up an enrolled student's batchId and subMJC by their UAN.
 * This is needed to construct the registration redirect URL after sign in.
 */
export async function getStudentRedirectInfo(uan: string) {
  try {
    const student = await db.query.EnrolledStudentTable.findFirst({
      where: eq(EnrolledStudentTable.UAN, uan),
    });

    if (!student) {
      return { success: false, message: "Student not found" };
    }

    return {
      success: true,
      data: {
        batchId: student.batchId,
        uan: student.UAN,
        mjc: student.subMJC,
      },
    };
  } catch (error) {
    console.error("[getStudentRedirectInfo] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching student info.",
    };
  }
}
