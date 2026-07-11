"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  StudentFeePaymentTable,
  admissionOpenTable,
  batchTable,
  semesterAdmissionOpenTable,
} from "@/lib/db/schema";

interface PendingFeeResult {
  hasPendingFee: boolean;
  isAdmissionOpen: boolean;
}

export async function checkPendingFee(
  studentId: string,
  currentSemesterCount: number,
  batchId: string,
  isPassed: boolean,
): Promise<PendingFeeResult> {
  // Students who have passed have no pending fees
  if (isPassed) {
    return { hasPendingFee: false, isAdmissionOpen: false };
  }

  // Check if current semester fee is paid
  const payment = await db.query.StudentFeePaymentTable.findFirst({
    where: and(
      eq(StudentFeePaymentTable.studentId, studentId),
      eq(StudentFeePaymentTable.semesterCount, currentSemesterCount),
      eq(StudentFeePaymentTable.status, "Success"),
    ),
  });

  if (payment) {
    return { hasPendingFee: false, isAdmissionOpen: false };
  }

  // Fee is pending — check if admission window is open for online payment
  let isAdmissionOpen = false;

  const batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.id, batchId),
  });

  if (batch) {
    if (currentSemesterCount === 1) {
      const admissionOpen = await db.query.admissionOpenTable.findFirst({
        where: eq(admissionOpenTable.batchId, batchId),
      });
      if (admissionOpen) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(admissionOpen.startDate);
        const end = new Date(admissionOpen.endDate);
        isAdmissionOpen = today >= start && today <= end;
      }
    } else {
      const semesterAdmission =
        await db.query.semesterAdmissionOpenTable.findFirst({
          where: and(
            eq(
              semesterAdmissionOpenTable.academicSessionId,
              batch.academicSessionId,
            ),
            eq(
              semesterAdmissionOpenTable.semesterCount,
              currentSemesterCount,
            ),
          ),
        });
      if (semesterAdmission) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(semesterAdmission.startDate);
        const end = new Date(semesterAdmission.endDate);
        isAdmissionOpen = today >= start && today <= end;
      }
    }
  }

  return { hasPendingFee: true, isAdmissionOpen };
}
