"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type UpdateAdmissionOpenSchema,
  updateAdmissionOpenSchema,
} from "../lib/zod-type/admission-open-type";
import type { useGetAdmissionOpens } from "../query/get-admission-opens";
import { useUpdateAdmissionOpen } from "../query/mut-update-admission-open";
import { AdmissionOpenFormFields } from "./admission-open-form-fields";

export type AdmissionOpenRow = NonNullable<
  ReturnType<typeof useGetAdmissionOpens>["data"]
>[number];

interface EditAdmissionOpenSheetProps {
  record: AdmissionOpenRow;
}

export function EditAdmissionOpenSheet({
  record,
}: EditAdmissionOpenSheetProps) {
  const [open, setOpen] = useState(false);
  const updateAdmissionOpenMutation = useUpdateAdmissionOpen();

  const form = useForm<UpdateAdmissionOpenSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(updateAdmissionOpenSchema) as any,
    defaultValues: {
      id: record.id,
      batchId: record.batchId,
      startDate: record.startDate,
      endDate: record.endDate,
      lateFee: record.lateFee ?? 0,
      practicalFee: record.practicalFee ?? 500,
      isDateExtended: record.isDateExtended ?? false,
      extendedDate: record.extendedDate ?? "",
    },
  });

  async function onSubmit(values: UpdateAdmissionOpenSchema) {
    try {
      await updateAdmissionOpenMutation.mutateAsync(values);
      setOpen(false);
    } catch (_e) {
      // Error handled by mutation state
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          form.reset({
            id: record.id,
            batchId: record.batchId,
            startDate: record.startDate,
            endDate: record.endDate,
            lateFee: record.lateFee ?? 0,
            practicalFee: record.practicalFee ?? 500,
            isDateExtended: record.isDateExtended ?? false,
            extendedDate: record.extendedDate ?? "",
          });
        }
        setOpen(nextOpen);
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1">
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Edit Admission Dates</SheetTitle>
            <SheetDescription>
              Update the timeline or extension dates for this admission batch.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <AdmissionOpenFormFields form={form} />
            </div>
          </div>

          {updateAdmissionOpenMutation.error ? (
            <FieldError>{updateAdmissionOpenMutation.error.message}</FieldError>
          ) : null}

          <SheetFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
