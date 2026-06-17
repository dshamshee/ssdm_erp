"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { StudentFeePaymentTable } from "@/lib/db/schema/student";

export async function verifyPayment(transactionId: string) {
  try {
    if (!transactionId || transactionId.trim() === "") {
      return { success: false, message: "Transaction ID is required." };
    }

    const payment = await db.query.StudentFeePaymentTable.findFirst({
      where: eq(StudentFeePaymentTable.transactionId, transactionId.trim()),
      with: { student: true },
    });

    if (!payment) {
      return {
        success: false,
        message: "No payment transaction found with this ID.",
      };
    }

    return {
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: Number(payment.amount),
        status: payment.status,
        paymentMode: payment.paymentMode,
        semesterCount: payment.semesterCount,
        createdAt: payment.createdAt,
        student: payment.student
          ? {
              id: payment.student.id,
              name: payment.student.name,
              uan: payment.student.UAN,
              collegeRoll: payment.student.collegeRoll,
              email: payment.student.email,
              phone: payment.student.phone,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("[verifyPayment] Error:", error);
    return {
      success: false,
      message: "Something went wrong while verifying payment.",
    };
  }
}
