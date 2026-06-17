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
  type UpdateNoticeSchema,
  updateNoticeSchema,
} from "../lib/zod-type/notice-type";
import type { useGetNotices } from "../query/get-notices";
import { useUpdateNotice } from "../query/mut-update-notice";
import { NoticeFormFields } from "./notice-form-fields";

export type NoticeRow = NonNullable<
  ReturnType<typeof useGetNotices>["data"]
>[number];

interface EditNoticeSheetProps {
  record: NoticeRow;
}

export function EditNoticeSheet({ record }: EditNoticeSheetProps) {
  const [open, setOpen] = useState(false);
  const updateNoticeMutation = useUpdateNotice();

  const form = useForm<UpdateNoticeSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(updateNoticeSchema) as any,
    defaultValues: {
      id: record.id,
      title: record.title,
      description: record.description ?? "",
      startDate: record.startDate,
      endDate: record.endDate,
      file: record.file ?? "",
    },
  });

  async function onSubmit(values: UpdateNoticeSchema) {
    try {
      await updateNoticeMutation.mutateAsync(values);
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
            file: record.file ?? "",
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
            <SheetTitle>Edit Notice</SheetTitle>
            <SheetDescription>
              Update the notice details and PDF file.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <NoticeFormFields form={form} />
            </div>
          </div>

          {updateNoticeMutation.error ? (
            <FieldError>{updateNoticeMutation.error.message}</FieldError>
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
