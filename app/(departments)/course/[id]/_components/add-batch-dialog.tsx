"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  type AddBatchSchema,
  addBatchSchema,
} from "../lib/zod-type/add-batch-type";
import { useAddBatch } from "../query/mut-add-batch";

interface AddBatchDialogProps {
  courseId: string;
}

export function AddBatchDialog({ courseId }: AddBatchDialogProps) {
  const [open, setOpen] = useState(false);
  const addBatch = useAddBatch();
  const { data: sessions = [] } = useQuery(getAcademicSessionsQuery());

  const form = useForm<AddBatchSchema>({
    resolver: zodResolver(addBatchSchema),
    defaultValues: { courseId, academicSessionId: "", perSemesterFee: 0 },
  });

  async function onSubmit(values: AddBatchSchema) {
    try {
      await addBatch.mutateAsync(values);
      form.reset({ courseId, academicSessionId: "", perSemesterFee: 0 });
      setOpen(false);
    } catch {
      // Error is already set on addBatch.error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          New Batch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Add Batch</DialogTitle>
            <DialogDescription>
              Create a new batch by selecting an academic session and setting
              the per-semester fee.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Controller
              control={form.control}
              name="academicSessionId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Academic Session</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="">
                        Select a session
                      </NativeSelectOption>
                      {sessions.map((session) => (
                        <NativeSelectOption key={session.id} value={session.id}>
                          {session.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="perSemesterFee"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Fee per Semester (₹)</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      placeholder="e.g. 15000"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {addBatch.error ? (
              <FieldError>{addBatch.error.message}</FieldError>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
