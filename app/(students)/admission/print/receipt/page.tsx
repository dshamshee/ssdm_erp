import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import { AdmittedStudentTable, StudentFeePaymentTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ShieldAlert, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PrintTrigger } from "../_components/print-trigger";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getReceiptDetails(studentId: string) {
  try {
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.id, studentId),
      with: {
        batch: {
          with: { course: true, academicSession: true, admissionOpen: true },
        },
      },
    });

    if (!student) return { student: null, payment: null, breakdown: null };

    const payment = await db.query.StudentFeePaymentTable.findFirst({
      where: eq(StudentFeePaymentTable.studentId, studentId),
      orderBy: [desc(StudentFeePaymentTable.createdAt)],
    });

    if (!payment) return { student, payment: null, breakdown: null };

    // Calculate fee breakdown matching PaymentForm logic
    // We can deduce late fee and practical fee based on total paid vs base fee
    const admissionFee = student.batch?.perSemesterFee || 5000;
    const paidAmount = payment.amount;

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

    // Deduce practical fee
    const practicalFee = Math.max(0, paidAmount - (admissionFee + lateFee));

    return {
      student,
      payment,
      breakdown: { admissionFee, lateFee, practicalFee, paidAmount },
    };
  } catch (error) {
    console.error("getReceiptDetails error:", error);
    return { student: null, payment: null, breakdown: null };
  }
}

export default async function PrintReceiptPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  const { student, payment, breakdown } = studentId
    ? await getReceiptDetails(studentId)
    : { student: null, payment: null, breakdown: null };

  const formatDate = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-800 p-4 sm:p-8 font-sans selection:bg-blue-900 selection:text-white">
      {/* Print Trigger */}
      {student && payment && <PrintTrigger />}

      {/* Control Actions - hidden in print */}
      <div className="max-w-xl mx-auto mb-6 flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm print:hidden">
        <Link
          href={`/admission/success?studentId=${studentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Confirmation
        </Link>
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow shadow-blue-900/10 cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>

      {student && payment && breakdown ? (
        <article className="max-w-xl mx-auto bg-white border border-slate-300 print:border-0 rounded-2xl print:rounded-none p-6 sm:p-8 shadow-md print:shadow-none space-y-6 relative overflow-hidden">
          {/* Letterhead */}
          <div className="flex flex-col items-center text-center space-y-1.5 border-b-2 border-slate-800 pb-3">
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {config.name}
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">
              {config.address}, {config.city}, {config.state} &bull; PIN:{" "}
              {config.pincode}
            </p>
            <div className="pt-1.5">
              <span className="px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded">
                Fees Deposit Payment Receipt
              </span>
            </div>
          </div>

          {/* Receipt Identifiers */}
          <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-650 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">
                Receipt Status
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAID (SUCCESS)
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">
                Payment Date
              </span>
              <span className="font-bold text-slate-800">
                {formatDate(payment.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">
                Transaction ID
              </span>
              <span className="font-bold text-slate-800 font-mono">
                {payment.transactionId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">
                Payment Mode
              </span>
              <span className="font-bold text-slate-800 font-mono">
                {payment.paymentMode}
              </span>
            </div>
          </div>

          {/* Student details */}
          <div className="space-y-1.5 text-[10px] text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">
                Student Name:
              </span>
              <span className="font-bold text-slate-900 uppercase">
                {student.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">
                UAN / Roll No:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {student.UAN}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">
                Course Details:
              </span>
              <span className="font-bold text-slate-900">
                {student.batch?.course?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">
                Academic Session:
              </span>
              <span className="font-bold text-slate-900">
                {student.batch?.academicSession?.name}
              </span>
            </div>
          </div>

          {/* Fees Itemized breakdown */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 text-[10px] border-b border-slate-200 pb-1 uppercase tracking-wider">
              Fees Description
            </h3>
            <div className="space-y-2 text-[10px] text-slate-650">
              <div className="flex justify-between">
                <span>Admission Registration Fee</span>
                <span className="font-semibold text-slate-800">
                  ₹{breakdown.admissionFee.toLocaleString("en-IN")}
                </span>
              </div>
              {breakdown.practicalFee > 0 && (
                <div className="flex justify-between">
                  <span>Practical Lab & Examination Fee</span>
                  <span className="font-semibold text-slate-800">
                    ₹{breakdown.practicalFee.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
              {breakdown.lateFee > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Late Fee Surcharge</span>
                  <span>₹{breakdown.lateFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-2 text-[11px] font-black text-slate-900">
                <span>Total Fees Paid</span>
                <span className="text-blue-900">
                  ₹{breakdown.paidAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Signature validation */}
          <div className="pt-10 flex justify-between items-end text-center text-[9px] font-bold text-slate-800">
            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-300 w-28" />
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                Student signature
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-6 border-b border-dashed border-slate-300 w-28" />
              <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                Authorized Cashier
              </span>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Failed to Load Receipt
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            We could not pull the payment transaction details. Please check the
            student identifier is valid.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
