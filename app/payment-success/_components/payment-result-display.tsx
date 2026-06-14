"use client";

import {
  CheckCircle2,
  XCircle,
  Lock,
  Printer,
  Home,
  Receipt,
  ArrowRight,
  FileText,
} from "lucide-react";

interface PaymentResult {
  paymentId: string;
  status: string;
  amount: number;
  txnId: string;
  errorMessage: string | null;
}

interface PaymentResultDisplayProps {
  result: PaymentResult | null;
  errorMessage: string | null;
  student: {
    id: string;
    uan: string;
    name: string;
  } | null;
}

export const PaymentResultDisplay = ({
  result,
  errorMessage,
  student,
}: PaymentResultDisplayProps) => {
  const isSuccess = result?.status === "Success";

  // 1. Error / Decryption Failure case
  if (errorMessage || !result) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-rose-500 to-red-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full translate-x-20 -translate-y-10" />
          <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full -translate-x-10 translate-y-10" />

          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10 animate-pulse">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Payment Verification Failed
          </h2>
          <p className="text-rose-100 text-sm max-w-sm mx-auto">
            We encountered an error while verifying your transaction with the
            payment gateway.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 space-y-2">
            <h4 className="text-rose-800 font-bold text-sm">Error Details</h4>
            <p className="text-rose-600 text-xs font-semibold leading-relaxed">
              {errorMessage ||
                "The transaction is either invalid or could not be processed at this time."}
            </p>
          </div>

          <p className="text-xs text-slate-400 text-center leading-relaxed max-w-md mx-auto">
            If money has been deducted from your account, please do not panic.
            The gateway callback will automatically settle pending transactions
            within 24 hours. You can also contact support with your reference
            details.
          </p>

          <div className="flex gap-4">
            <a
              href="/admission"
              className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-950 transition text-center shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Verify & Try Again
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/"
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Transaction Failed case (Decrypted successfully but txn status is FAILED)
  if (!isSuccess) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-rose-500 to-red-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full translate-x-20 -translate-y-10" />
          <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full -translate-x-10 translate-y-10" />

          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10">
            <XCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Transaction Failed
          </h2>
          <p className="text-rose-100 text-sm max-w-sm mx-auto">
            The payment gateway reported a failed transaction request.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            <h3 className="text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-rose-600" />
              Transaction Receipt Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Reference ID
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {result.paymentId}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Transaction ID
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {result.txnId}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Failed Amount
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  ₹{result.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Status Badge
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mt-1">
                  FAILED
                </span>
              </div>
            </div>
            {result.errorMessage && (
              <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 text-rose-600 text-xs font-medium">
                Gateway Remark: {result.errorMessage}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <a
              href="/admission"
              className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-950 transition text-center shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Verify & Try Again
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/"
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Successful Payment case
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full translate-x-20 -translate-y-10" />
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full -translate-x-10 translate-y-10" />

        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10 animate-bounce">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Payment Successful!
        </h2>
        <p className="text-emerald-100 text-sm max-w-sm mx-auto">
          Your admission payment was successfully authenticated and processed.
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/* Thank You Message */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 text-center space-y-2">
          <h3 className="text-emerald-800 font-extrabold text-base">
            Thank You, {student?.name || "Candidate"}!
          </h3>
          <p className="text-emerald-600 text-xs font-semibold leading-relaxed max-w-md mx-auto">
            Your admission registration has been successfully verified and completed. Please print the payment receipt and application form below for your records.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4 print:bg-white print:border-0 print:p-0">
          <h3 className="text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2 flex items-center gap-2 print:border-b-2 print:text-base">
            <Receipt className="h-4 w-4 text-emerald-600 print:hidden" />
            Transaction Confirmation Receipt
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs print:grid-cols-2 print:gap-6 print:text-sm">
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Candidate Name
              </p>
              <p className="text-slate-700 font-semibold mt-0.5">
                {student?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Candidate UAN
              </p>
              <p className="text-slate-700 font-semibold mt-0.5 font-mono">
                {student?.uan || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Invoice Order ID
              </p>
              <p className="text-slate-700 font-semibold mt-0.5 font-mono">
                {result.paymentId}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Gateway Txn Number
              </p>
              <p className="text-slate-700 font-semibold mt-0.5 font-mono">
                {result.txnId}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Payment Mode
              </p>
              <p className="text-slate-700 font-semibold mt-0.5">
                Online Gateway (GetEpay)
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px] print:text-xs">
                Admission Status
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1 print:bg-transparent print:border-0 print:p-0 print:text-emerald-700 print:text-sm">
                CONFIRMED
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-slate-800 print:border-t-2 print:pt-4">
            <span className="font-extrabold text-sm print:text-base">
              Total Amount Authenticated
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">
              ₹{result.amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <a
            href={`/admission/print/receipt?paymentId=${result.paymentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700 transition shadow-lg cursor-pointer flex items-center justify-center gap-2 text-center"
          >
            <Printer className="h-4 w-4" />
            Print Payment Receipt
          </a>
          {student && (
            <a
              href={`/admission/print/application?studentId=${student.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-950 transition shadow-lg cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <FileText className="h-4 w-4" />
              Print Application
            </a>
          )}
        </div>

        <div className="flex gap-4 print:hidden justify-center">
          <a
            href="/"
            className="py-2.5 px-6 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="h-3.5 w-3.5" />
            Go to Portal Home
          </a>
        </div>

        {/* Security message */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-medium pt-2 border-t border-slate-100 print:hidden">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>
            This receipt is legally binding. System logs verified via 256-bit
            hash.
          </span>
        </div>
      </div>
    </div>
  );
};
