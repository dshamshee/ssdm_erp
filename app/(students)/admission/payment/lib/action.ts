"use server";

import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  StudentFeePaymentTable,
  subjectTable,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function fetchPaymentInfo(studentId: string) {
  try {
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.id, studentId),
      with: {
        batch: {
          with: { course: true, academicSession: true, admissionOpen: true },
        },
      },
    });

    if (!student) {
      return { success: false, message: "Student record not found" };
    }

    // Determine subject IDs for practical fee calculation
    const allSubjectIds = [
      student.subMJC,
      ...(student.subMIC || []),
      ...(student.subMDC || []),
      ...(student.subAEC || []),
      ...(student.subSEC || []),
      ...(student.subVAC || []),
    ].filter(Boolean);

    let practicalFee = 0;
    if (allSubjectIds.length > 0) {
      const subjects = await db
        .select({
          hasPractical: subjectTable.hasPractical,
          practicalFee: subjectTable.practicalFee,
        })
        .from(subjectTable)
        .where(inArray(subjectTable.id, allSubjectIds));

      for (const sub of subjects) {
        if (sub.hasPractical) {
          // Add practical fee if configured, otherwise fallback to standard default ₹500
          practicalFee += sub.practicalFee || 500;
        }
      }
    }

    // Determine late fee
    let lateFee = 0;
    const admissionOpen = student.batch?.admissionOpen?.[0];
    if (admissionOpen) {
      const today = new Date();
      const end = new Date(admissionOpen.endDate);
      const isLate = today > end;
      if (isLate && admissionOpen.lateFee) {
        lateFee = admissionOpen.lateFee;
      }
    }

    const admissionFee = student.batch?.perSemesterFee || 5000;
    const totalAmount = admissionFee + practicalFee + lateFee;

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          UAN: student.UAN,
          collegeRoll: student.collegeRoll,
          courseName: student.batch?.course?.name,
          sessionName: student.batch?.academicSession?.name,
        },
        fees: { admissionFee, practicalFee, lateFee, totalAmount },
      },
    };
  } catch (error: any) {
    console.error("fetchPaymentInfo error:", error);
    return {
      success: false,
      message: error.message || "Failed to load payment information",
    };
  }
}

export async function processPayment({
  studentId,
  amount,
  paymentMode,
}: {
  studentId: string;
  amount: number;
  paymentMode: string;
}) {
  try {
    // Generate transaction ID
    const transactionId = "TXN-" + Math.floor(100000 + Math.random() * 900000);

    const [paymentRecord] = await db
      .insert(StudentFeePaymentTable)
      .values({
        id: createId(),
        studentId,
        semesterCount: 1,
        amount,
        paymentMode,
        transactionId,
        status: "Success",
      })
      .returning();

    return {
      success: true,
      data: {
        id: paymentRecord.id,
        transactionId: paymentRecord.transactionId,
      },
    };
  } catch (error: any) {
    console.error("processPayment error:", error);
    return {
      success: false,
      message: error.message || "Failed to record payment transaction",
    };
  }
}
