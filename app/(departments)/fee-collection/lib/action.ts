"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { batchTable, courseTable } from "@/lib/db/schema/department";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

interface AdmissionDateFilter {
  mode: "all" | "date" | "range";
  admissionDateFrom?: string;
  admissionDateTo?: string;
}

function parseDateInput(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getAdmissionDateRange(filter?: AdmissionDateFilter) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const fallbackEnd = new Date(todayStart);
  fallbackEnd.setDate(fallbackEnd.getDate() + 1);

  const fromDate = filter?.admissionDateFrom
    ? parseDateInput(filter.admissionDateFrom)
    : todayStart;
  const toDate = filter?.admissionDateTo
    ? parseDateInput(filter.admissionDateTo)
    : fromDate;

  if (!fromDate || !toDate) {
    return { start: todayStart, end: fallbackEnd };
  }

  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(toDate);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    const normalizedEnd = new Date(start);
    normalizedEnd.setDate(normalizedEnd.getDate() + 1);

    return { start: end, end: normalizedEnd };
  }

  end.setDate(end.getDate() + 1);

  return { start, end };
}

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

export async function getFilterOptions() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const courses = await db.query.courseTable.findMany({
      where: eq(courseTable.isActive, true),
      with: {
        batches: {
          where: eq(batchTable.isActive, true),
          with: { academicSession: true },
        },
      },
    });

    return { success: true, data: courses };
  } catch (error) {
    console.error("[getFilterOptions] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch filter options"),
    };
  }
}

export async function getFeeCollectionReport(
  batchId: string,
  semesterCount: number,
) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    if (!batchId || !semesterCount) {
      return {
        success: false,
        message: "Batch ID and Semester Count are required",
      };
    }

    const students = await db.query.AdmittedStudentTable.findMany({
      where: eq(AdmittedStudentTable.batchId, batchId),
      with: {
        feePayments: {
          where: eq(StudentFeePaymentTable.semesterCount, semesterCount),
        },
      },
      orderBy: (students, { asc }) => [asc(students.collegeRoll)],
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("[getFeeCollectionReport] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch fee collection report"),
    };
  }
}

export async function getGlobalFeeStats(filter?: AdmissionDateFilter) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const isAllTime = filter?.mode === "all";
    const admissionDateRange = getAdmissionDateRange(filter);

    const studentDateFilter = isAllTime
      ? undefined
      : and(
          gte(EnrolledStudentTable.createdAt, admissionDateRange.start),
          lt(EnrolledStudentTable.createdAt, admissionDateRange.end),
        );

    const admittedDateFilter = isAllTime
      ? undefined
      : and(
          gte(AdmittedStudentTable.createdAt, admissionDateRange.start),
          lt(AdmittedStudentTable.createdAt, admissionDateRange.end),
        );

    const paymentDateFilter = isAllTime
      ? eq(StudentFeePaymentTable.status, "Success")
      : and(
          eq(StudentFeePaymentTable.status, "Success"),
          gte(StudentFeePaymentTable.createdAt, admissionDateRange.start),
          lt(StudentFeePaymentTable.createdAt, admissionDateRange.end),
        );

    const [{ count: studentCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(EnrolledStudentTable)
      .where(studentDateFilter);

    const [{ count: periodAdmissions }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(AdmittedStudentTable)
      .where(admittedDateFilter);

    const [{ sum: totalCollected }] = await db
      .select({
        sum: sql`sum(${StudentFeePaymentTable.amount})`.mapWith(Number),
      })
      .from(StudentFeePaymentTable)
      .where(paymentDateFilter);

    return {
      success: true,
      data: {
        totalStudents: studentCount,
        periodAdmissions,
        totalCollected: totalCollected || 0,
      },
    };
  } catch (error) {
    console.error("[getGlobalFeeStats] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch global stats"),
    };
  }
}
