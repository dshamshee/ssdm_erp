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
  type AddTenderSchema,
  addTenderSchema,
} from "../lib/zod-type/tender-type";
import { useAddTender } from "../query/mut-add-tender";
import { TenderFormFields } from "./tender-form-fields";

export function AddTenderSheet() {
  const [open, setOpen] = useState(false);
  const addTenderMutation = useAddTender();

  const form = useForm<AddTenderSchema>({
    // biome-ignore lint/suspicious/noExplicitAny: resolver type needs to bypass RHF/Zod type mismatches due to refined schemas
    resolver: zodResolver(addTenderSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      document: "",
    },
  });

  async function onSubmit(values: AddTenderSchema) {
    try {
      await addTenderMutation.mutateAsync(values);
      form.reset({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        document: "",
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
          Add Tender
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Add Tender</SheetTitle>
            <SheetDescription>
              Create a new tender with details and upload the document.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto">
            <div className="grid gap-3">
              <TenderFormFields form={form} />
            </div>
          </div>

          {addTenderMutation.error ? (
            <FieldError>{addTenderMutation.error.message}</FieldError>
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
