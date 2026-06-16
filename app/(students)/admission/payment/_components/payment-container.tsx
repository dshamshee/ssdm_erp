"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Lock,
  CheckCircle,
  CreditCard,
  AlertTriangle,
  User,
  Sparkles,
  BookOpen,
  Receipt,
  Loader2,
  Calendar,
} from "lucide-react";
import { initiatePayment } from "../lib/action";

interface StudentDetails {
  id: string;
  name: string;
  UAN: string;
  email: string;
  phone: string;
  collegeRoll: string;
}

interface FeeDetails {
  tuitionFee: number;
  practicalFee: number;
  lateFee: number;
  totalAmount: number;
}

interface PaymentDetails {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  createdAt: string | Date;
}

interface PaymentContainerProps {
  student: StudentDetails;
  isAlreadyPaid: boolean;
  payment: PaymentDetails | null;
  fees: FeeDetails | null;
  pendingPayment: PaymentDetails | null;
  initialError?: string | null;
}

export const PaymentContainer = ({
  student,
  isAlreadyPaid,
  payment,
  fees,
  pendingPayment,
  initialError = null,
}: PaymentContainerProps) => {
  const [isPending, setIsPending] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  const handlePay = async () => {
    if (!fees) return;
    setIsPending(true);
    setErrorMessage(null);

    try {
      setLoadingText("Securing checkout transaction...");
      const res = await initiatePayment({
        studentId: student.id,
        tuitionFee: fees.tuitionFee,
        practicalFee: fees.practicalFee,
        lateFee: fees.lateFee,
      });

      if (res.success && res.paymentUrl) {
        setLoadingText("Redirecting to GetEpay Secure Gateway...");
        toast.success("Checkout initialized! Redirecting...");
        // Redirect browser to GetEpay payment portal
        window.location.href = res.paymentUrl;
      } else {
        setErrorMessage(
          res.message || "Failed to initiate payment gateway request.",
        );
        toast.error("Checkout Failed");
        setIsPending(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "An unexpected error occurred. Please try again.",
      );
      toast.error("An error occurred");
      setIsPending(false);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If already paid
  if (isAlreadyPaid && payment) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden max-w-2xl mx-auto transform transition-all duration-300">
        {/* Visual Success Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-10 text-white text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full translate-x-20 -translate-y-10" />
          <div className="absolute bottom-0 left-0 h-24 w-24 bg-white/5 rounded-full -translate-x-10 translate-y-10" />

          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto ring-4 ring-white/10 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Admission Confirmed
          </h2>
          <p className="text-emerald-100 text-sm max-w-sm mx-auto">
            Your admission fee payment has been successfully completed and
            registered.
          </p>
        </div>

        {/* Receipt details */}
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/50 space-y-4">
            <h3 className="text-slate-800 font-bold text-base border-b border-slate-200/60 pb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              Receipt Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  Candidate Name
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {student.name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  UAN (Registration)
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {student.UAN}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  College Roll
                </p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {student.collegeRoll}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  Transaction Status
                </p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                  SUCCESS
                </span>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  Transaction ID
                </p>
                <p className="text-slate-700 font-mono font-medium mt-0.5 text-xs">
                  {payment.transactionId}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                  Payment Date
                </p>
                <p className="text-slate-700 font-medium mt-0.5">
                  {formatDate(payment.createdAt)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-slate-800">
              <span className="font-bold text-sm">Total Fee Paid</span>
              <span className="text-xl font-extrabold text-emerald-600">
                ₹{payment.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-semibold hover:bg-slate-900 transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Print Receipt
            </button>
            <a
              href="/"
              className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Pay Flow
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 transition-all duration-300">
          <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center ring-4 ring-blue-500/10">
            <Loader2 className="h-8 w-8 text-blue-900 animate-spin" />
          </div>
          <p className="text-slate-800 font-bold text-lg">{loadingText}</p>
          <p className="text-slate-400 text-xs animate-pulse">
            Do not close this page or press back
          </p>
        </div>
      )}

      {/* Elegant Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 px-8 py-8 text-white relative">
        <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full translate-x-20 -translate-y-10" />

        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 backdrop-blur-md text-blue-200 border border-blue-400/20">
              <Sparkles className="h-3 w-3" />
              Final Step: Fee Payment
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Admission Invoice
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            UNPAID
          </span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Student Personal Info */}
        <div className="border border-slate-150 rounded-2xl p-6 bg-slate-50/50 space-y-4">
          <h3 className="text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-950" />
            Candidate Registration Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                Student Name
              </span>
              <p className="text-slate-700 font-bold text-sm">{student.name}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                UAN (Registration Number)
              </span>
              <p className="text-slate-700 font-bold text-sm">{student.UAN}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                Email Address
              </span>
              <p className="text-slate-700 font-semibold">{student.email}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                Phone Number
              </span>
              <p className="text-slate-700 font-semibold">{student.phone}</p>
            </div>
          </div>
        </div>

        {/* Warning / Notes */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-rose-800 font-bold text-sm">
                Payment Generation Failed
              </h4>
              <p className="text-rose-600 text-xs font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {pendingPayment && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1 text-xs">
              <h4 className="text-amber-800 font-bold text-sm">
                Pending Payment Found
              </h4>
              <p className="text-amber-600 font-medium">
                You have a pending transaction initiated on{" "}
                {formatDate(pendingPayment.createdAt)}. You can proceed below to
                verify your checkout.
              </p>
            </div>
          </div>
        )}

        {/* Fee breakdown details */}
        {fees && (
          <div className="border border-slate-150 rounded-2xl p-6 space-y-4 bg-white">
            <h3 className="text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-950" />
              Fee Structure Breakup
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Admission / Tuition Fee</span>
                <span className="text-slate-800 font-bold">
                  ₹{fees.tuitionFee.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  Practical Laboratory Fee
                  {fees.practicalFee > 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                      Applied
                    </span>
                  )}
                </span>
                <span className="text-slate-800 font-bold">
                  {fees.practicalFee > 0
                    ? `₹${fees.practicalFee.toLocaleString("en-IN")}`
                    : "₹0"}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  Late Fee Surcharge
                  {fees.lateFee > 0 && (
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-semibold border border-rose-200">
                      Late Window
                    </span>
                  )}
                </span>
                <span className="text-slate-800 font-bold">
                  {fees.lateFee > 0
                    ? `₹${fees.lateFee.toLocaleString("en-IN")}`
                    : "₹0"}
                </span>
              </div>

              <div className="border-t border-slate-200/60 pt-4 flex justify-between items-center text-slate-900">
                <span className="font-extrabold">Total Amount Payable</span>
                <span className="text-2xl font-extrabold text-blue-900">
                  ₹{fees.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Secure Checkout Button */}
        <button
          onClick={handlePay}
          disabled={isPending || !fees}
          className="w-full py-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl font-semibold hover:from-blue-950 hover:to-slate-950 transition shadow-lg hover:shadow-indigo-950/20 active:scale-[0.99] transform duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          <CreditCard className="h-5 w-5" />
          Proceed to GetEpay Portal
        </button>

        {/* Gateway security footer badges */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-medium pt-2 border-t border-slate-100">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          <span>
            Secured with AES-256 GCM encryption. Powered by GetEpay Gateway.
          </span>
        </div>
      </div>
    </div>
  );
};
