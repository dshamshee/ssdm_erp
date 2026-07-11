"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FeePaymentPopupProps {
  studentName: string;
  studentId: string;
  semesterCount: number;
  isAdmissionOpen: boolean;
}

export function FeePaymentPopup({
  studentName,
  studentId,
  semesterCount,
  isAdmissionOpen,
}: FeePaymentPopupProps) {
  const [open, setOpen] = useState(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl gap-0"
        showCloseButton={false}
      >
        {/* Top gradient accent strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="p-6 sm:p-8 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-xl animate-pulse" />
                <div className="relative h-16 w-16 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50">
                  <IconCreditCard className="h-8 w-8" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                <IconAlertTriangle className="h-3 w-3" />
                Fee Payment Required
              </div>
              <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
                Semester {semesterCount} Fee Pending
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                {isAdmissionOpen
                  ? `Hi ${studentName}, your tuition fee for Semester ${semesterCount} is still pending. Please complete the payment to avoid any late fee charges.`
                  : `Hi ${studentName}, your tuition fee for Semester ${semesterCount} has not been received. The online payment window is currently closed. Please contact the college administration for assistance.`}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Info Strip */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
            <div className="h-9 w-9 bg-slate-200/80 rounded-lg flex items-center justify-center shrink-0">
              <IconAlertTriangle className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isAdmissionOpen
                ? "Complete your payment before the deadline to avoid late fee surcharges. Click below to proceed to the secure payment portal."
                : "The fee payment window for your semester has closed. Please visit the college office with your student ID for offline payment processing."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isAdmissionOpen && (
              <Link
                href={`/admission/payment?studentId=${studentId}&semesterCount=${semesterCount}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98] transition-all"
              >
                <IconCreditCard className="h-4 w-4" />
                Pay Semester Fee
                <IconArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl font-bold text-slate-500"
              onClick={() => setOpen(false)}
            >
              Remind Me Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
