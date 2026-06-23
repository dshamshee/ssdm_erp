"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PassConfirmDialogProps {
  selectedNames: string[];
  isPending: boolean;
  onConfirm: () => void;
  trigger: React.ReactNode;
}

export function PassConfirmDialog({
  selectedNames,
  isPending,
  onConfirm,
  trigger,
}: PassConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const count = selectedNames.length;

  function handleConfirm() {
    onConfirm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-amber-500 text-xl">🎓</span>
            Confirm Promote to Passed
          </DialogTitle>
          <DialogDescription>
            {count === 1 ? (
              <span>
                Are you sure you want to promote <strong>{selectedNames[0]}</strong> to Passed status?
              </span>
            ) : (
              <span>
                Are you sure you want to promote <strong>{count}</strong> selected students to Passed status?
              </span>
            )}
            {" "}Once marked as Passed, these students are considered graduated. Their active status will be disabled, and they can no longer be promoted to further semesters.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? "Promoting..." : "Yes, Promote to Passed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
