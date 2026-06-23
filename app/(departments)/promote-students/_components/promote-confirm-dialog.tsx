"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PromoteConfirmDialogProps {
  sessionName: string;
  eligibleCount: number;
  totalCount: number;
  isPending: boolean;
  onConfirm: () => void;
  disabled?: boolean;
}

export function PromoteConfirmDialog({
  sessionName,
  eligibleCount,
  totalCount,
  isPending,
  onConfirm,
  disabled,
}: PromoteConfirmDialogProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0 = closed, 1 = warning, 2 = final

  function handleOpen() {
    setStep(1);
  }

  function handleClose() {
    if (!isPending) setStep(0);
  }

  function handleConfirm() {
    onConfirm();
    setStep(0);
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        disabled={disabled || eligibleCount === 0}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        id="promote-students-btn"
      >
        Promote Students
      </Button>

      {/* Step 1: Warning */}
      <Dialog
        open={step === 1}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-amber-500 text-xl">⚠️</span>
              Confirm Semester Promotion
            </DialogTitle>
            <DialogDescription>
              You are about to promote{" "}
              <strong>{eligibleCount}</strong>{" "}
              {eligibleCount === 1 ? "student" : "students"} from session{" "}
              <strong>{sessionName}</strong> to the next semester.
              This action will increment the semester count for all eligible
              students (active, non-detained, not passed, and below max
              semester cap).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-muted p-3 text-xs space-y-1">
            <p>
              <strong>Total students:</strong> {totalCount}
            </p>
            <p>
              <strong>Eligible for promotion:</strong> {eligibleCount}
            </p>
            <p>
              <strong>Skipped (detained/inactive/passed/max sem):</strong>{" "}
              {totalCount - eligibleCount}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => setStep(2)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              I Understand, Continue →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step 2: Final Confirmation */}
      <Dialog
        open={step === 2}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-red-500 text-xl">🔴</span>
              Final Confirmation
            </DialogTitle>
            <DialogDescription>
              This action is <strong>irreversible</strong>! Are you
              absolutely sure you want to promote{" "}
              <strong>{eligibleCount}</strong>{" "}
              {eligibleCount === 1 ? "student" : "students"}?
              Each eligible student&apos;s semester count will be incremented
              by 1. Students who have already reached the maximum semester
              for their course will be automatically skipped.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Go Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Promoting..." : "Yes, Promote Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
