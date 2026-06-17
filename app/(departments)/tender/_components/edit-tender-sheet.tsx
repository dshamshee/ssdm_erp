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
  type UpdateTenderSchema,
  updateTenderSchema,
} from "../lib/zod-type/tender-type";
import type { useGetTenders } from "../query/get-tenders";
import { useUpdateTender } from "../query/mut-update-tender";
import { TenderFormFields } from "./tender-form-fields";

export type TenderRow = NonNullable<
  ReturnType<typeof useGetTenders>["data"]
>[number];

interface EditTenderSheetProps {
  record: TenderRow;
}

export function EditTenderSheet({ record }: EditTenderSheetProps) {
  const [open, setOpen] = useState(false);
  const updateTenderMutation = useUpdateTender();

  const form = useForm<UpdateTenderSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(updateTenderSchema) as any,
    defaultValues: {
      id: record.id,
      title: record.title,
      description: record.description ?? "",
      startDate: record.startDate,
      endDate: record.endDate,
      document: record.document,
    },
  });

  async function onSubmit(values: UpdateTenderSchema) {
    try {
      await updateTenderMutation.mutateAsync(values);
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
            title: record.title,
            description: record.description ?? "",
            startDate: record.startDate,
            endDate: record.endDate,
            document: record.document,
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
            <SheetTitle>Edit Tender</SheetTitle>
            <SheetDescription>
              Update the tender details and document.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <TenderFormFields form={form} />
            </div>
          </div>

          {updateTenderMutation.error ? (
            <FieldError>{updateTenderMutation.error.message}</FieldError>
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
