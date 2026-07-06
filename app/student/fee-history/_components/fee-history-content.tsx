"use client";

import { IconAlertTriangle, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useGetStudentFeeData } from "../query/get-student-fee-data";
import { CurrentSemesterFeeCard } from "./current-semester-fee-card";
import { NextSemesterFeeCard } from "./next-semester-fee-card";
import { PaymentHistoryTable } from "./payment-history-table";

export function FeeHistoryContent() {
  const { data, isPending, isError, error } = useGetStudentFeeData();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">
          Loading fee history and records...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Failed to Load Fee Records
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {error?.message ||
            "An error occurred while fetching your fee history details. Please try again or contact the administrator."}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const {
    student,
    hasPaid,
    payment,
    allPayments,
    isCurrentSemesterAdmissionOpen,
    nextSemesterAdmission,
    nextSemesterFees,
    pendingNextSemesterPayment,
    nextSemesterCount,
  } = data;

  // If profile is incomplete, show a message to complete profile first
  if (!student.isProfileCompleted) {
    return (
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <IconAlertTriangle className="h-6 w-6" />
          </div>
          <div className="text-center sm:text-left space-y-1 flex-grow">
            <h3 className="text-sm font-extrabold text-slate-800">
              Profile Incomplete
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please complete your profile before accessing fee history and
              payment features. Your fee records will be available after your
              profile is verified.
            </p>
          </div>
          <Link
            href="/student/complete-profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-600/10 hover:shadow-amber-600/20 active:scale-[0.98] transition-all"
          >
            Complete Profile
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const showNextSemesterCard =
    hasPaid && nextSemesterAdmission && nextSemesterFees;

  return (
    <div className="space-y-8">
      {/* Fee Status Grid */}
      <div
        className={`grid grid-cols-1 ${
          showNextSemesterCard ? "lg:grid-cols-2" : "grid-cols-1"
        } gap-8`}
      >
        <CurrentSemesterFeeCard
          student={student}
          hasPaid={hasPaid}
          payment={payment}
          isCurrentSemesterAdmissionOpen={isCurrentSemesterAdmissionOpen}
        />

        {showNextSemesterCard && (
          <NextSemesterFeeCard
            student={student}
            nextSemesterAdmission={nextSemesterAdmission}
            nextSemesterFees={nextSemesterFees}
            pendingNextSemesterPayment={pendingNextSemesterPayment}
            nextSemesterCount={nextSemesterCount}
          />
        )}
      </div>

      {/* Payment History & Receipts */}
      <PaymentHistoryTable allPayments={allPayments} />
    </div>
  );
}

