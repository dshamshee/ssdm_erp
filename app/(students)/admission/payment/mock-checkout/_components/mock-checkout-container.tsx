"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simulateCallback } from "../../lib/action";
import { CheckCircle2, XCircle, Loader2, CreditCard, ShieldAlert, FileText } from "lucide-react";

interface ContainerProps {
  paymentId: string;
  studentName: string;
  uan: string;
  amount: number;
}

export function MockCheckoutContainer({ paymentId, studentName, uan, amount }: ContainerProps) {
  const [loading, setLoading] = useState<"SUCCESS" | "FAILED" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSimulate = async (status: "SUCCESS" | "FAILED") => {
    try {
      setLoading(status);
      setErrorMsg(null);

      // Trigger the mock callback to local endpoint
      const result = await simulateCallback({ paymentId, status });

      if (result.success) {
        // Redirect to success landing page mimicking redirect from GetEpay
        // The landing page expects the paymentId and decrypted response, but if database is updated,
        // it can just query the updated status.
        router.push(`/payment-success?paymentId=${paymentId}`);
      } else {
        setErrorMsg(result.message || "Failed to process transaction callback.");
        setLoading(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12 text-slate-100 antialiased">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-xl shadow-2xl md:p-8">
        
        {/* Header Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold text-yellow-500">
            <ShieldAlert className="h-4 w-4" />
            <span>GetEpay Developer Sandbox Bypass</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Simulate Gateway Checkout
          </h1>
          <p className="mt-2.5 text-sm text-slate-400">
            Third-party sandbox is currently unresponsive or offline. Use this dashboard to test payment callback synchronization.
          </p>
        </div>

        {/* Error Display */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <XCircle className="h-4 w-4" />
              <span>Simulation Failed</span>
            </div>
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Invoice Card */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-6">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4 mb-4">
            <FileText className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white text-lg">Transaction Summary</span>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Candidate Name</span>
              <span className="font-semibold text-slate-100">{studentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">UAN Reference</span>
              <span className="font-mono font-medium text-slate-100">{uan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction ID</span>
              <span className="font-mono text-slate-300 text-xs truncate max-w-[200px]">{paymentId}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-2">
              <span className="text-slate-200 font-semibold text-base">Total Amount Payable</span>
              <span className="font-black text-2xl text-blue-400">
                ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Simulated Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSimulate("SUCCESS")}
            disabled={loading !== null}
            className="group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading === "SUCCESS" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Simulating Successful Callback...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Simulate Successful Payment</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSimulate("FAILED")}
            disabled={loading !== null}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 font-bold text-red-400 shadow-lg hover:bg-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading === "FAILED" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Simulating Failed Callback...</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Simulate Failed Payment</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Local simulation does not debit real currency.</span>
        </div>

      </div>
    </div>
  );
}
