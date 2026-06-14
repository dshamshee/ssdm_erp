"use server";

import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";
import {
  subjectTable,
  batchTable,
  admissionOpenTable,
} from "@/lib/db/schema/department";
import { eq, and, inArray } from "drizzle-orm";
import { GcmPgEncryption } from "@/lib/getepay-encrypt";
import { createId } from "@paralleldrive/cuid2";

const PRACTICAL_FEE_CONST = 600;

export async function getStudentPaymentDetails(params: {
  uan?: string;
  studentId?: string;
}) {
  try {
    const { uan, studentId } = params;
    if (!uan && !studentId) {
      return { success: false, message: "Missing student identifier." };
    }

    // Find student
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: studentId
        ? eq(AdmittedStudentTable.id, studentId)
        : eq(AdmittedStudentTable.UAN, uan!),
    });

    if (!student) {
      return { success: false, message: "Student record not found." };
    }

    // Check if successful payment exists for semesterCount = 1
    const existingSuccessfulPayment =
      await db.query.StudentFeePaymentTable.findFirst({
        where: and(
          eq(StudentFeePaymentTable.studentId, student.id),
          eq(StudentFeePaymentTable.semesterCount, 1),
          eq(StudentFeePaymentTable.status, "Success"),
        ),
      });

    if (existingSuccessfulPayment) {
      return {
        success: true,
        isAlreadyPaid: true,
        student,
        payment: existingSuccessfulPayment,
      };
    }

    // Fetch batch fee
    const batch = await db.query.batchTable.findFirst({
      where: eq(batchTable.id, student.batchId),
    });

    if (!batch) {
      return { success: false, message: "Batch fee information not found." };
    }

    const tuitionFee = batch.perSemesterFee;

    // Check if student has practical subjects
    const allSubjectIds = [
      student.subMJC,
      ...(student.subMIC || []),
      ...(student.subMDC || []),
      ...(student.subAEC || []),
      ...(student.subSEC || []),
      ...(student.subVAC || []),
    ].filter(Boolean) as string[];

    let hasPractical = false;
    if (allSubjectIds.length > 0) {
      const subjects = await db
        .select({ hasPractical: subjectTable.hasPractical })
        .from(subjectTable)
        .where(inArray(subjectTable.id, allSubjectIds));

      hasPractical = subjects.some((s) => s.hasPractical === true);
    }

    const practicalFee = hasPractical ? PRACTICAL_FEE_CONST : 0;

    // Fetch admission window details for late fee check
    const admissionOpen = await db.query.admissionOpenTable.findFirst({
      where: eq(admissionOpenTable.batchId, student.batchId),
    });

    let lateFee = 0;
    if (admissionOpen) {
      const currentDate = new Date();
      const standardEndDate = new Date(admissionOpen.endDate);
      // If current date is past standard end date, charge late fee
      if (currentDate > standardEndDate && admissionOpen.lateFee) {
        lateFee = admissionOpen.lateFee;
      }
    }

    const totalAmount = tuitionFee + practicalFee + lateFee;

    // Check for any pending payments to show
    const existingPendingPayment =
      await db.query.StudentFeePaymentTable.findFirst({
        where: and(
          eq(StudentFeePaymentTable.studentId, student.id),
          eq(StudentFeePaymentTable.semesterCount, 1),
          eq(StudentFeePaymentTable.status, "Pending"),
        ),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

    return {
      success: true,
      isAlreadyPaid: false,
      student,
      fees: { tuitionFee, practicalFee, lateFee, totalAmount },
      pendingPayment: existingPendingPayment || null,
    };
  } catch (error) {
    console.error("[getStudentPaymentDetails] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function initiatePayment(params: {
  studentId: string;
  tuitionFee: number;
  practicalFee: number;
  lateFee: number;
}) {
  try {
    const { studentId, tuitionFee, practicalFee, lateFee } = params;

    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.id, studentId),
    });

    if (!student) {
      return { success: false, message: "Student record not found." };
    }

    const totalAmount = tuitionFee + practicalFee + lateFee;

    // Setup GetEpay configurations
    const mid = process.env.GETEPAY_MID;
    const terminalId = process.env.GETEPAY_TERMINAL_ID;
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;
    const getepayUrl = process.env.GETEPAY_URL;
    const returnUrl =
      process.env.GETEPAY_RETURN_URL || "http://localhost:3000/payment-success";
    const callbackUrl =
      process.env.GETEPAY_CALLBACK_URL ||
      "http://localhost:3000/api/payments/callback";

    if (!mid || !terminalId || !getepayKey || !getepayIv || !getepayUrl) {
      return {
        success: false,
        message:
          "GetEpay credentials are not properly configured in the system environment.",
      };
    }

    // 1. Create a unique Transaction ID and CUID payment ID
    const paymentId = createId();
    const txnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Insert record in student_fee_payment
    await db
      .insert(StudentFeePaymentTable)
      .values({
        id: paymentId,
        studentId: student.id,
        semesterCount: 1,
        amount: totalAmount,
        paymentMode: "Online",
        transactionId: txnId,
        status: "Pending",
      });

    // Build return and callback URLs appending paymentId query parameter
    const buildUrlWithPaymentId = (baseUrl: string, id: string) => {
      try {
        const u = new URL(baseUrl);
        u.searchParams.set("paymentId", id);
        return u.toString();
      } catch {
        return `${baseUrl}?paymentId=${id}`;
      }
    };

    const finalReturnUrl = buildUrlWithPaymentId(returnUrl, paymentId);
    const finalCallbackUrl = buildUrlWithPaymentId(callbackUrl, paymentId);

    // 3. Prepare payload for GetEpay
    const payloadJson = {
      mid: String(mid).trim(),
      terminalId: String(terminalId).trim(),
      amount: String(totalAmount.toFixed(2)),
      merchantTransactionId: txnId,
      merchantOrderNo: paymentId,
      transactionDate: new Date().toISOString(),
      ru: finalReturnUrl,
      callbackUrl: finalCallbackUrl,
      currency: "INR",
      paymentMode: "ALL",
      bankId: "455",
      txnType: "single",
      productType: "IPG",
      txnNote: `Payment for ${student.name || "Student"} - ${paymentId}`,
      udf1: student.phone || "",
      udf2: student.email || "",
      udf3: student.name || "",
      udf4: "",
      udf5: "",
      udf6: "",
      udf7: "",
      udf8: "",
      udf9: "",
      udf10: "",
    };

    console.log("[initiatePayment] GetEpay Payload:", payloadJson);

    // 4. Encrypt payload
    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const ciphertext = await encryptor.encrypt(JSON.stringify(payloadJson));

    // 5. POST to GetEpay generateInvoice
    const response = await fetch(getepayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mid: String(mid).trim(),
        terminalId: String(terminalId).trim(),
        req: ciphertext,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GetEpay invoice request failed with HTTP ${response.status}`,
      );
    }

    const resJson = await response.json();
    console.log("[initiatePayment] GetEpay API Raw Response:", resJson);

    if (resJson && resJson.status === "success" && resJson.response) {
      // Decrypt response
      const decryptedText = await encryptor.decrypt(resJson.response);
      const decrypted = JSON.parse(decryptedText);
      console.log("[initiatePayment] Decrypted GetEpay Response:", decrypted);

      if (decrypted.status === "success" && decrypted.paymentUrl) {
        return { success: true, paymentUrl: decrypted.paymentUrl, paymentId };
      } else {
        if (!isProduction) {
          console.warn(
            "[initiatePayment] GetEpay Sandbox returned validation error. Redirecting to Sandbox Bypass Checkout.",
          );
          return {
            success: true,
            paymentUrl: `/admission/payment/mock-checkout?paymentId=${paymentId}`,
            paymentId,
            isMock: true,
          };
        }
        return {
          success: false,
          message:
            decrypted.message || "GetEpay returned an error in the response.",
        };
      }
    } else {
      if (!isProduction) {
        console.warn(
          "[initiatePayment] GetEpay Sandbox API failed. Redirecting to Sandbox Bypass Checkout.",
        );
        return {
          success: true,
          paymentUrl: `/admission/payment/mock-checkout?paymentId=${paymentId}`,
          paymentId,
          isMock: true,
        };
      }
      return {
        success: false,
        message:
          resJson.message || "Failed to initiate payment invoice request.",
      };
    }
  } catch (error) {
    console.error("[initiatePayment] Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function simulateCallback(params: {
  paymentId: string;
  status: "SUCCESS" | "FAILED";
}) {
  try {
    const { paymentId, status } = params;

    const payment = await db.query.StudentFeePaymentTable.findFirst({
      where: eq(StudentFeePaymentTable.id, paymentId),
    });

    if (!payment) {
      return { success: false, message: "Payment record not found in system." };
    }

    const mid = process.env.GETEPAY_MID || "108";
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;

    if (!getepayKey || !getepayIv) {
      throw new Error("Missing GetEpay encryption keys in system configuration.");
    }

    const mockResponse = {
      mid,
      merchantOrderNo: paymentId,
      txnStatus: status,
      getepayTxnId: `BANK-MOCK-${Date.now()}`,
      paymentMode: "Online",
      txnAmount: String(Number(payment.amount).toFixed(2)),
    };

    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const encryptedText = await encryptor.encrypt(JSON.stringify(mockResponse));

    // Send callback to local route
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/payments/callback?paymentId=${paymentId}`;

    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        response: encryptedText,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Callback handler failed with HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("[simulateCallback] Error:", error);
    return { success: false, message: error.message || "Callback simulation failed." };
  }
}

export async function processPaymentReturn(responseCiphertext: string) {
  try {
    const getepayKey = process.env.GETEPAY_KEY;
    const getepayIv = process.env.GETEPAY_IV;

    if (!getepayKey || !getepayIv) {
      throw new Error(
        "Missing GetEpay encryption keys in system configuration.",
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const encryptor = new GcmPgEncryption(getepayIv, getepayKey, isProduction);
    const decryptedText = await encryptor.decrypt(responseCiphertext);
    const decrypted = JSON.parse(decryptedText);

    console.log("[processPaymentReturn] Decrypted return payload:", decrypted);

    // Validate gateway credentials in response
    const configuredMid = String(process.env.GETEPAY_MID || "").trim();
    const responseMid =
      decrypted?.mid || decrypted?.merchantId || decrypted?.merchantCode || "";
    if (
      configuredMid &&
      responseMid &&
      String(responseMid).trim() !== configuredMid
    ) {
      throw new Error("Merchant ID mismatch in gateway response.");
    }

    // Extract fields
    const paymentId = decrypted.merchantOrderNo;
    const txnStatus = String(
      decrypted.txnStatus || decrypted.paymentStatus || decrypted.status || "",
    )
      .trim()
      .toUpperCase();
    const bankTxnNo =
      decrypted.getepayTxnId ||
      decrypted.bankTxnNo ||
      decrypted.referenceNo ||
      null;
    const paymentMode = decrypted.paymentMode || "Online";
    const errorMessage = decrypted.message || decrypted.errorMessage || null;

    if (!paymentId) {
      throw new Error(
        "Missing merchantOrderNo (paymentId) in response payload.",
      );
    }

    const existingPayment = await db.query.StudentFeePaymentTable.findFirst({
      where: eq(StudentFeePaymentTable.id, paymentId),
    });

    if (!existingPayment) {
      throw new Error("Payment record not found in system.");
    }

    const isSuccess = txnStatus === "SUCCESS";
    const status = isSuccess ? "Success" : "Failed";

    // Update payment record in database
    await db
      .update(StudentFeePaymentTable)
      .set({
        status,
        paymentMode,
        transactionId: bankTxnNo || existingPayment.transactionId,
        updatedAt: new Date(),
      })
      .where(eq(StudentFeePaymentTable.id, paymentId));

    if (isSuccess) {
      // Find the admitted student and set isFeePaid = true in EnrolledStudentTable
      const student = await db.query.AdmittedStudentTable.findFirst({
        where: eq(AdmittedStudentTable.id, existingPayment.studentId),
      });

      if (student) {
        await db
          .update(EnrolledStudentTable)
          .set({ isFeePaid: true, updatedAt: new Date() })
          .where(eq(EnrolledStudentTable.UAN, student.UAN));
      }
    }

    return {
      success: true,
      paymentId,
      status,
      amount: existingPayment.amount,
      txnId: bankTxnNo || existingPayment.transactionId,
      errorMessage: isSuccess ? null : errorMessage,
    };
  } catch (error) {
    console.error("[processPaymentReturn] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during redirect processing.",
    };
  }
}
