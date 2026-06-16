import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { processPaymentReturn } from "@/app/(students)/admission/payment/lib/action";
import { SiteFooter } from "@/components/informative/site-footer";
import { SiteHeader } from "@/components/informative/site-header";
import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import { StudentFeePaymentTable } from "@/lib/db/schema/student";
import { PaymentResultDisplay } from "./_components/payment-result-display";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const response = resolvedParams.response as string | undefined;

  const config = getCollegeConfig();

  let paymentResult = null;
  let errorMsg = null;
  let studentInfo = null;

  let lookupPaymentId: string | null = null;

  if (response) {
    const res = await processPaymentReturn(response);
    if (res.success && res.paymentId) {
      lookupPaymentId = res.paymentId;
    } else {
      errorMsg = res.message || "Failed to parse transaction response.";
    }
  } else if (resolvedParams.paymentId) {
    lookupPaymentId = resolvedParams.paymentId as string;
  } else {
    errorMsg =
      "No transaction response payload was received from the payment gateway.";
  }

  if (lookupPaymentId) {
    // Retry polling loop: check the database up to 5 times with a 1.2s delay if status is not Success yet
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    let payment = null;

    for (let attempt = 1; attempt <= 5; attempt++) {
      payment = await db.query.StudentFeePaymentTable.findFirst({
        where: eq(StudentFeePaymentTable.id, lookupPaymentId),
        with: { student: true },
      });

      if (payment && payment.status !== "Pending") {
        break;
      }

      if (attempt < 5) {
        console.log(
          `[PaymentSuccessPage] Attempt ${attempt}: Status is ${payment?.status || "Unknown"}. Waiting for webhook callback...`,
        );
        await sleep(1200);
      }
    }

    if (payment) {
      paymentResult = {
        paymentId: payment.id,
        status: payment.status || "Pending",
        amount: Number(payment.amount),
        txnId: payment.transactionId || "N/A",
        errorMessage:
          payment.status === "Failed"
            ? "Transaction failed or cancelled."
            : null,
      };
      if (payment.student) {
        studentInfo = {
          id: payment.student.id,
          uan: payment.student.UAN,
          name: payment.student.name,
        };
      }
    } else {
      errorMsg = "Transaction reference was not found in our database records.";
    }
  }

  // If the payment failed, redirect the student back to the checkout page to retry
  if (paymentResult && paymentResult.status === "Failed" && studentInfo) {
    redirect(
      `/admission/payment?uan=${studentInfo.uan}&studentId=${studentInfo.id}&error=payment_failed`,
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <PaymentResultDisplay
            result={paymentResult}
            errorMessage={errorMsg}
            student={studentInfo}
          />
        </div>
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
