"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentFeePaymentTable,
  subjectTable,
} from "@/lib/db/schema";

/**
 * Verify that a student is enrolled in the given batch with the given UAN and MJC.
 * No longer creates a user account — signup is handled after registration form submission.
 */
export const fetchEnrolledStudent = async ({
  batchId,
  UAN,
  MJC,
}: {
  batchId: string;
  UAN: string;
  MJC: string;
}) => {
  try {
    // 1. Check if they have already registered (admitted)
    const admittedStudent = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN),
    });

    if (admittedStudent) {
      // Check if they have completed payment
      const payment = await db.query.StudentFeePaymentTable.findFirst({
        where: and(
          eq(StudentFeePaymentTable.studentId, admittedStudent.id),
          eq(StudentFeePaymentTable.semesterCount, 1),
          eq(StudentFeePaymentTable.status, "Success"),
        ),
      });

      if (payment) {
        return {
          success: false,
          message:
            "You have already registered and completed your admission payment.",
        };
      } else {
        // Registered but payment is pending/failed
        return {
          success: true,
          verification: true,
          isPendingPayment: true,
          studentId: admittedStudent.id,
        };
      }
    }

    // 2. Otherwise verify enrolled student
    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(
        eq(EnrolledStudentTable.batchId, batchId),
        eq(EnrolledStudentTable.UAN, UAN),
        eq(EnrolledStudentTable.subMJC, MJC),
      ),
    });

    if (!student) {
      return { success: false, message: "Student Not Found" };
    }

    return { success: true, verification: true, isPendingPayment: false };
  } catch (error) {
    return {
      success: false,
      message:
        "Internal Server Error, Failed to fetch enrolled student details",
    };
  }
};

export const fetchActiveSubjects = async () => {
  try {
    const subjects = await db.query.subjectTable.findMany({
      where: eq(subjectTable.isActive, true),
      orderBy: (subjects, { asc }) => [asc(subjects.name)],
    });
    return {
      success: true,
      subjects: subjects.map((s) => ({ id: s.id, name: s.name, code: s.code })),
    };
  } catch (error) {
    return { success: false, message: "Failed to fetch subjects" };
  }
};
