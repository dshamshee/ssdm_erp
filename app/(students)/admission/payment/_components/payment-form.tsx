"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ShieldCheck,
  IndianRupee,
  QrCode,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { processPayment } from "../lib/action";
import { toast } from "sonner";

interface PaymentFormProps {
  paymentData: {
    student: {
      id: string;
      name: string;
      UAN: string;
      collegeRoll: string;
      courseName: string;
      sessionName: string;
    };
    fees: {
      admissionFee: number;
      practicalFee: number;
      lateFee: number;
      totalAmount: number;
    };
  };
}

export function PaymentForm({ paymentData }: PaymentFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<"UPI" | "CARD" | "NB">("UPI");
  const [isPending, setIsPending] = useState(false);

  const handlePay = async () => {
    setIsPending(true);
    try {
      const res = await processPayment({
        studentId: paymentData.student.id,
        amount: paymentData.fees.totalAmount,
        paymentMode: method,
      });

      if (res.success && res.data) {
        toast.success("Payment successful!");
        router.push(`/admission/success?studentId=${paymentData.student.id}`);
      } else {
        toast.error(res.message || "Failed to process payment");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred during payment processing");
    } finally {
      setIsPending(false);
    }
  };

  const formatCurrency = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Invoice Details */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border border-muted-foreground/10 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-t-xl py-5">
            <CardTitle className="text-base font-bold uppercase tracking-wide">
              Admission Fee Invoice
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Verify your fee summary details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Student Name
                </span>
                <span className="font-bold text-slate-800">
                  {paymentData.student.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                  UAN / Roll No
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {paymentData.student.UAN}
                </span>
              </div>
              <div className="col-span-2 border-t border-slate-200/50 pt-2 mt-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-0.5">
                  Course & Session
                </span>
                <span className="font-bold text-slate-800">
                  {paymentData.student.courseName} (
                  {paymentData.student.sessionName})
                </span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5">
                Fee Breakdown
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Semester Admission Fee</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(paymentData.fees.admissionFee)}
                  </span>
                </div>
                {paymentData.fees.practicalFee > 0 && (
                  <div className="flex justify-between">
                    <span>Practical Examination/Lab Fee</span>
                    <span className="font-medium text-slate-800">
                      {formatCurrency(paymentData.fees.practicalFee)}
                    </span>
                  </div>
                )}
                {paymentData.fees.lateFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Late Submission Fine</span>
                    <span className="font-bold">
                      {formatCurrency(paymentData.fees.lateFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
                  <span>Total Payable Amount</span>
                  <span className="text-blue-900 text-base">
                    {formatCurrency(paymentData.fees.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-3 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center rounded-b-xl">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            Official SSDM College Fee Payment Receipt generation portal.
          </CardFooter>
        </Card>
      </div>

      {/* Payment Screen Selection */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border border-muted-foreground/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">
              Select Payment Method
            </CardTitle>
            <CardDescription className="text-xs">
              Choose how you wish to pay the fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Options Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMethod("UPI")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  method === "UPI"
                    ? "bg-white text-blue-900 shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <QrCode className="h-4 w-4" /> UPI
              </button>
              <button
                type="button"
                onClick={() => setMethod("CARD")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  method === "CARD"
                    ? "bg-white text-blue-900 shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CreditCard className="h-4 w-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setMethod("NB")}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  method === "NB"
                    ? "bg-white text-blue-900 shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Building2 className="h-4 w-4" /> Net Banking
              </button>
            </div>

            {/* Selected Method Details */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl min-h-[160px] flex flex-col justify-center">
              {method === "UPI" && (
                <div className="space-y-4 text-center">
                  <QrCode className="h-16 w-16 text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">
                      Scan QR Code or Use UPI ID
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Mock UPI checkout sandbox active
                    </p>
                  </div>
                </div>
              )}

              {method === "CARD" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      Card Number
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="•••• •••• •••• ••••"
                      className="h-9 w-full bg-white border border-slate-200 rounded-lg px-3 text-xs outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        Expiry
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="MM / YY"
                        className="h-9 w-full bg-white border border-slate-200 rounded-lg px-3 text-xs outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        CVV
                      </label>
                      <input
                        type="password"
                        disabled
                        placeholder="•••"
                        className="h-9 w-full bg-white border border-slate-200 rounded-lg px-3 text-xs outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === "NB" && (
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Select Bank
                  </label>
                  <select
                    disabled
                    className="h-9 w-full bg-white border border-slate-200 rounded-lg px-3 text-xs outline-none cursor-not-allowed"
                  >
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2.5 pt-0">
            <Button
              type="button"
              disabled={isPending}
              onClick={handlePay}
              className="w-full py-5 rounded-xl font-bold bg-blue-900 hover:bg-blue-800 text-xs shadow-md shadow-blue-950/15 cursor-pointer text-white"
            >
              {isPending
                ? "Validating & Processing..."
                : `Pay ${formatCurrency(paymentData.fees.totalAmount)}`}
            </Button>
            <p className="text-[9px] text-slate-400 text-center leading-normal">
              By clicking above, you proceed to complete your mock admission
              payment sequence.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
