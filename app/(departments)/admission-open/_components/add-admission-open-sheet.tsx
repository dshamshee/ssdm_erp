"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
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
  type AddAdmissionOpenSchema,
  addAdmissionOpenSchema,
} from "../lib/zod-type/admission-open-type";
import { useAddAdmissionOpen } from "../query/mut-add-admission-open";
import { AdmissionOpenFormFields } from "./admission-open-form-fields";

export function AddAdmissionOpenSheet() {
  const [open, setOpen] = useState(false);
  const addAdmissionOpenMutation = useAddAdmissionOpen();

  const form = useForm<AddAdmissionOpenSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(addAdmissionOpenSchema) as any,
    defaultValues: {
      batchId: "",
      startDate: "",
      endDate: "",
      lateFee: 0,
      practicalFee: 500,
      isDateExtended: false,
      extendedDate: "",
    },
  });

  async function onSubmit(values: AddAdmissionOpenSchema) {
    try {
      await addAdmissionOpenMutation.mutateAsync(values);
      form.reset({
        batchId: "",
        startDate: "",
        endDate: "",
        lateFee: 0,
        practicalFee: 500,
        isDateExtended: false,
        extendedDate: "",
      });
      setOpen(false);
    } catch (_e) {
      // Error handled by mutation state
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Add Admission Dates
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Open Admission</SheetTitle>
            <SheetDescription>
              Set the start and end dates for a course batch's admission
              process.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <AdmissionOpenFormFields form={form} />
            </div>
          </div>

          {addAdmissionOpenMutation.error ? (
            <FieldError>{addAdmissionOpenMutation.error.message}</FieldError>
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
