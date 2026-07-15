"use server";

import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  academicSessionTable,
  batchTable,
  courseTable,
  departmentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


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

export async function getDCRStats() {
  try {

    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Today's payments (all semesters, Success status)
    const todayResult = await db
      .select({ amount: StudentFeePaymentTable.amount })
      .from(StudentFeePaymentTable)
      .where(
        and(
          eq(StudentFeePaymentTable.status, "Success"),
          gte(StudentFeePaymentTable.createdAt, startOfToday),
          lte(StudentFeePaymentTable.createdAt, endOfToday),
        ),
      );

    const todayAmount = todayResult.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const todayCount = todayResult.length;

    // This Month's payments (all semesters, Success status)
    const monthResult = await db
      .select({ amount: StudentFeePaymentTable.amount })
      .from(StudentFeePaymentTable)
      .where(
        and(
          eq(StudentFeePaymentTable.status, "Success"),
          gte(StudentFeePaymentTable.createdAt, startOfMonth),
          lte(StudentFeePaymentTable.createdAt, endOfMonth),
        ),
      );

    const monthAmount = monthResult.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const monthCount = monthResult.length;

    // Total payments (all semesters, Success status)
    const totalResult = await db
      .select({ amount: StudentFeePaymentTable.amount })
      .from(StudentFeePaymentTable)
      .where(eq(StudentFeePaymentTable.status, "Success"));

    const totalAmount = totalResult.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const totalCount = totalResult.length;

    return {
      success: true,
      stats: {
        today: { amount: todayAmount, count: todayCount },
        month: { amount: monthAmount, count: monthCount },
        total: { amount: totalAmount, count: totalCount },
      },
    };
  } catch (error) {
    console.error("[getDCRStats] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching stats.",
    };
  }
}

export interface DCRFilters {
  startDate?: string;
  endDate?: string;
  semester?: string;
  departmentId?: string;
  courseId?: string;
  batchId?: string;
}

export async function getDCRReport(filters: DCRFilters = {}) {
  try {

    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }


    const { startDate, endDate, semester, departmentId, courseId, batchId } =
      filters;

    const conditions = [eq(StudentFeePaymentTable.status, "Success")];

    // Only filter by semester when a specific semester is selected
    if (semester && semester !== "all") {
      conditions.push(
        eq(StudentFeePaymentTable.semesterCount, Number(semester)),
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(StudentFeePaymentTable.createdAt, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(StudentFeePaymentTable.createdAt, end));
    }

    if (batchId && batchId !== "all") {
      conditions.push(eq(AdmittedStudentTable.batchId, batchId));
    }

    if (courseId && courseId !== "all") {
      conditions.push(eq(batchTable.courseId, courseId));
    }

    if (departmentId && departmentId !== "all") {
      conditions.push(eq(courseTable.departmentId, departmentId));
    }

    const report = await db
      .select({
        id: StudentFeePaymentTable.id,
        transactionId: StudentFeePaymentTable.transactionId,
        amount: StudentFeePaymentTable.amount,
        paymentMode: StudentFeePaymentTable.paymentMode,
        createdAt: StudentFeePaymentTable.createdAt,
        studentName: AdmittedStudentTable.name,
        uan: AdmittedStudentTable.UAN,
        courseName: courseTable.name,
        sessionName: academicSessionTable.name,
      })
      .from(StudentFeePaymentTable)
      .innerJoin(
        AdmittedStudentTable,
        eq(StudentFeePaymentTable.studentId, AdmittedStudentTable.id),
      )
      .innerJoin(batchTable, eq(AdmittedStudentTable.batchId, batchTable.id))
      .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
      .innerJoin(
        academicSessionTable,
        eq(batchTable.academicSessionId, academicSessionTable.id),
      )
      .where(and(...conditions))
      .orderBy(desc(StudentFeePaymentTable.createdAt));

    return {
      success: true,
      report: report.map((p) => ({
        id: p.id,
        transactionId: p.transactionId,
        amount: Number(p.amount),
        paymentMode: p.paymentMode,
        createdAt: p.createdAt.toISOString(),
        studentName: p.studentName,
        uan: p.uan,
        courseName: p.courseName,
        sessionName: p.sessionName,
      })),
    };
  } catch (error) {
    console.error("[getDCRReport] Error:", error);
    return {
      success: false,
      message: "Something went wrong while generating the DCR report.",
    };
  }
}

export async function getDCRFilterOptions() {
  try {

    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }


    const departments = await db
      .select({ id: departmentTable.id, name: departmentTable.name })
      .from(departmentTable);

    const courses = await db
      .select({
        id: courseTable.id,
        name: courseTable.name,
        departmentId: courseTable.departmentId,
      })
      .from(courseTable);

    const batches = await db
      .select({
        id: batchTable.id,
        courseId: batchTable.courseId,
        courseName: courseTable.name,
        sessionName: academicSessionTable.name,
      })
      .from(batchTable)
      .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
      .innerJoin(
        academicSessionTable,
        eq(batchTable.academicSessionId, academicSessionTable.id),
      );

    return {
      success: true,
      departments,
      courses,
      batches: batches.map((b) => ({
        id: b.id,
        courseId: b.courseId,
        name: `${b.courseName} (Session: ${b.sessionName})`,
      })),
    };
  } catch (error) {
    console.error("[getDCRFilterOptions] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching filter options.",
    };
  }
}
