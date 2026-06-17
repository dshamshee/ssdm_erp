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
  type AddNoticeSchema,
  addNoticeSchema,
} from "../lib/zod-type/notice-type";
import { useAddNotice } from "../query/mut-add-notice";
import { NoticeFormFields } from "./notice-form-fields";

export function AddNoticeSheet() {
  const [open, setOpen] = useState(false);
  const addNoticeMutation = useAddNotice();

  const form = useForm<AddNoticeSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(addNoticeSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      file: "",
    },
  });

  async function onSubmit(values: AddNoticeSchema) {
    try {
      await addNoticeMutation.mutateAsync(values);
      form.reset({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        file: "",
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
          Add Notice
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Add Notice</SheetTitle>
            <SheetDescription>
              Create a new notice with details and upload the PDF file.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <NoticeFormFields form={form} />
            </div>
          </div>

          {addNoticeMutation.error ? (
            <FieldError>{addNoticeMutation.error.message}</FieldError>
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
