"use client";

import { TrashIcon } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { useDeleteNotice } from "../query/mut-delete-notice";

interface DeleteNoticeDialogProps {
  id: string;
  title: string;
}

export function DeleteNoticeDialog({ id, title }: DeleteNoticeDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useDeleteNotice();

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      setOpen(false);
    } catch (_e) {
      // Error handled by mutation state
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-destructive hover:bg-destructive/10"
        >
          <TrashIcon className="size-3.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the notice{" "}
            <span className="font-semibold">{title}</span>. This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteMutation.error && (
          <FieldError className="my-2">
            {deleteMutation.error.message}
          </FieldError>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
