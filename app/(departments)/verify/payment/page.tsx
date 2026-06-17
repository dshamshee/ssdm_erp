"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { useVerifyPayment } from "./query/verify-payment";

export default function VerifyPaymentPage() {
  const [txnId, setTxnId] = useState("");
  const [searchTxnId, setSearchTxnId] = useState("");

  const {
    data: payment,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useVerifyPayment(searchTxnId);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = txnId.trim();
    if (!cleanId) {
      return;
    }
    if (cleanId === searchTxnId) {
      refetch();
    } else {
      setSearchTxnId(cleanId);
    }
  };

  const isPendingQuery = isFetching || isLoading;

  return (
    <ContentLayout title="Verify Payment">
      <div className="max-w-2xl mx-auto p-8 font-sans">
        <h1 className="text-2xl font-black mb-6 text-slate-800">
          Verify Payment Transaction
        </h1>

        <form onSubmit={handleVerify} className="flex gap-4 mb-8">
          <input
            type="text"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Enter Transaction ID (e.g. TXN-...)"
            className="flex-grow px-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-slate-800 text-sm font-medium"
          />
          <button
            type="submit"
            disabled={isPendingQuery}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {isPendingQuery ? "Fetching..." : "Fetch Details"}
          </button>
        </form>

        {isError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold">
            Something went wrong while fetching payment details.
          </div>
        )}

        {payment && (
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
              Transaction Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Invoice Reference ID
                </span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {payment.id}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Gateway Transaction ID
                </span>
                <p className="font-mono font-bold text-slate-800 mt-0.5">
                  {payment.transactionId}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Transaction Amount
                </span>
                <p className="font-bold text-slate-800 mt-0.5">
                  ₹{payment.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Payment Mode
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {payment.paymentMode}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Semester Count
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  Semester {payment.semesterCount}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Transaction Status
                </span>
                <p className="mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${payment.status === "Success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : payment.status === "Failed"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                  >
                    {payment.status.toUpperCase()}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  Payment Initiated At
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {new Date(payment.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {payment.student && (
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">
                  Student Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      Candidate Name
                    </span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {payment.student.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      UAN Reference
                    </span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">
                      {payment.student.uan}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      College Roll
                    </span>
                    <p className="font-mono font-semibold text-slate-700 mt-0.5">
                      {payment.student.collegeRoll}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      Contact Phone
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {payment.student.phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                      Contact Email
                    </span>
                    <p className="font-semibold text-slate-700 mt-0.5">
                      {payment.student.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
