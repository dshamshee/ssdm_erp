import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  EnrolledStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";
import { GcmPgEncryption } from "@/lib/getepay-encrypt";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("paymentId");

    // Parse body if it exists
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is not JSON, might be url-encoded or empty
      try {
        const formData = await req.formData();
        body = Object.fromEntries(formData.entries());
      } catch {
        // Fallback
      }
    }

    const rawResponse =
      body.response ||
      body.resp ||
      url.searchParams.get("response") ||
      url.searchParams.get("resp") ||
      null;

    if (!rawResponse) {
      console.warn("[Callback API] Missing response ciphertext");
      return NextResponse.json(
        { status: "error", message: "Missing response payload" },
        { status: 400 },
      );
    }

    const responseCiphertext = String(rawResponse).trim().includes(" ")
      ? String(rawResponse).trim().replace(/ /g, "+")
      : String(rawResponse).trim();

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

    console.log("[Callback API] Decrypted Callback Payload:", decrypted);

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
    const responsePaymentId = decrypted.merchantOrderNo;
    if (!paymentId && responsePaymentId) {
      paymentId = responsePaymentId;
    }

    if (!paymentId) {
      throw new Error(
        "Unable to identify payment records (missing paymentId).",
      );
    }

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
    const txnAmount = decrypted.txnAmount || decrypted.totalAmount || null;

    const existingPayment = await db.query.StudentFeePaymentTable.findFirst({
      where: or(
        eq(StudentFeePaymentTable.id, paymentId),
        eq(StudentFeePaymentTable.transactionId, paymentId),
      ),
    });

    if (!existingPayment) {
      throw new Error(`Payment record ${paymentId} not found in database.`);
    }

    // Set paymentId to the actual database CUID
    paymentId = existingPayment.id;

    // Verify amount mismatch
    if (txnStatus === "SUCCESS" && txnAmount !== null) {
      const expectedAmount = Number(existingPayment.amount);
      const receivedAmount = Number(String(txnAmount).replace(/,/g, ""));
      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error(
          `[Callback API] Amount mismatch: Expected ${expectedAmount}, Received ${receivedAmount}`,
        );
        await db
          .update(StudentFeePaymentTable)
          .set({ status: "Failed", updatedAt: new Date() })
          .where(eq(StudentFeePaymentTable.id, paymentId));

        return NextResponse.json(
          { status: "error", message: "Amount mismatch" },
          { status: 400 },
        );
      }
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

    return NextResponse.json({
      status: "success",
      message: "Callback processed successfully",
    });
  } catch (error: any) {
    console.error("[Callback API] Error:", error);
    return NextResponse.json(
      { status: "error", message: "Something went wrong while processing callback." },
      { status: 500 },
    );
  }
}
