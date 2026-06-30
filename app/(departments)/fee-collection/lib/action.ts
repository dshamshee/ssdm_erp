"use server";

import { and, eq, gte, lt, sql, exists } from "drizzle-orm";
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

    const paidAdmissionFilter = isAllTime
      ? exists(
          db
            .select({ one: sql`1` })
            .from(StudentFeePaymentTable)
            .where(
              and(
                eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
                eq(StudentFeePaymentTable.status, "Success"),
              ),
            ),
        )
      : and(
          gte(AdmittedStudentTable.createdAt, admissionDateRange.start),
          lt(AdmittedStudentTable.createdAt, admissionDateRange.end),
          exists(
            db
              .select({ one: sql`1` })
              .from(StudentFeePaymentTable)
              .where(
                and(
                  eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
                  eq(StudentFeePaymentTable.status, "Success"),
                ),
              ),
          ),
        );

    const [{ count: studentCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(EnrolledStudentTable)
      .where(studentDateFilter);

    const [{ count: periodAdmissions }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(AdmittedStudentTable)
      .where(paidAdmissionFilter);

    const [{ sum: totalCollected }] = await db
      .select({
        sum: sql`sum(${StudentFeePaymentTable.amount})`.mapWith(Number),
      })
      .from(StudentFeePaymentTable)
      .innerJoin(
        AdmittedStudentTable,
        eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
      )
      .where(
        isAllTime
          ? eq(StudentFeePaymentTable.status, "Success")
          : and(
              eq(StudentFeePaymentTable.status, "Success"),
              gte(AdmittedStudentTable.createdAt, admissionDateRange.start),
              lt(AdmittedStudentTable.createdAt, admissionDateRange.end),
            ),
      );

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

export async function getAdmissionsByDate(filter: AdmissionDateFilter) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    if (filter.mode === "all") {
      return { success: false, message: "Date filter is required" };
    }

    const admissionDateRange = getAdmissionDateRange(filter);

    const students = await db.query.AdmittedStudentTable.findMany({
      where: and(
        gte(AdmittedStudentTable.createdAt, admissionDateRange.start),
        lt(AdmittedStudentTable.createdAt, admissionDateRange.end),
        exists(
          db
            .select({ one: sql`1` })
            .from(StudentFeePaymentTable)
            .where(
              and(
                eq(
                  StudentFeePaymentTable.studentId,
                  sql`"AdmittedStudentTable"."id"`,
                ),
                eq(StudentFeePaymentTable.status, "Success"),
              ),
            ),
        ),
      ),
      with: {
        feePayments: { where: eq(StudentFeePaymentTable.status, "Success") },
      },
      orderBy: (s, { asc }) => [asc(s.createdAt)],
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("[getAdmissionsByDate] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch admissions by date"),
    };
  }
}

export async function getPaymentsByDate(filter: AdmissionDateFilter) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    if (filter.mode === "all") {
      return { success: false, message: "Date filter is required" };
    }

    const paymentDateRange = getAdmissionDateRange(filter);

    const payments = await db.query.StudentFeePaymentTable.findMany({
      where: and(
        eq(StudentFeePaymentTable.status, "Success"),
        gte(StudentFeePaymentTable.createdAt, paymentDateRange.start),
        lt(StudentFeePaymentTable.createdAt, paymentDateRange.end),
      ),
      with: {
        student: {
          with: { batch: { with: { course: true, academicSession: true } } },
        },
      },
      orderBy: (p, { asc }) => [asc(p.createdAt)],
    });

    return { success: true, data: payments };
  } catch (error) {
    console.error("[getPaymentsByDate] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch payments by date"),
    };
  }
}

export async function getPaymentStats(filter?: AdmissionDateFilter) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const isAllTime = filter?.mode === "all";
    const paymentDateRange = getAdmissionDateRange(filter);

    const [{ count: totalPayments }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(StudentFeePaymentTable)
      .where(
        isAllTime
          ? eq(StudentFeePaymentTable.status, "Success")
          : and(
              eq(StudentFeePaymentTable.status, "Success"),
              gte(StudentFeePaymentTable.createdAt, paymentDateRange.start),
              lt(StudentFeePaymentTable.createdAt, paymentDateRange.end),
            ),
      );

    const [{ sum: totalAmount }] = await db
      .select({
        sum: sql`sum(${StudentFeePaymentTable.amount})`.mapWith(Number),
      })
      .from(StudentFeePaymentTable)
      .where(
        isAllTime
          ? eq(StudentFeePaymentTable.status, "Success")
          : and(
              eq(StudentFeePaymentTable.status, "Success"),
              gte(StudentFeePaymentTable.createdAt, paymentDateRange.start),
              lt(StudentFeePaymentTable.createdAt, paymentDateRange.end),
            ),
      );

    return {
      success: true,
      data: {
        totalPayments: totalPayments || 0,
        totalAmount: totalAmount || 0,
      },
    };
  } catch (error) {
    console.error("[getPaymentStats] Error:", error);
    return {
      success: false,
      message: getErrorMessage(error, "Failed to fetch payment stats"),
    };
  }
}
