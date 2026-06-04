"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useGetSubjects } from "@/app/(departments)/subjects/query/get-subjects";
import { Button } from "@/components/ui/button";
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
  type AddDepartmentSchema,
  addDepartmentSchema,
} from "../lib/zod-type/add-department-type";
import { useAddDepartment } from "../query/mut-add-department";

export function AddDepartmentSheet() {
  const [open, setOpen] = useState(false);
  const addDepartment = useAddDepartment();
  const { data: subjects = [], isPending, isError, error } = useGetSubjects();

  const mjcSubjects = useMemo(
    () => subjects.filter((subject) => subject.type === "MJC"),
    [
      subjects,
    ],
  );

  const form = useForm<AddDepartmentSchema>({
    resolver: zodResolver(addDepartmentSchema) as never,
    defaultValues: {
      subjectId: "",
      code: "",
      description: "",
    },
  });

  async function onSubmit(values: AddDepartmentSchema) {
    await addDepartment.mutateAsync(values);
    form.reset({
      subjectId: "",
      code: "",
      description: "",
    });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Create Department
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex h-full flex-col gap-6"
        >
          <SheetHeader>
            <SheetTitle>Add Department</SheetTitle>
            <SheetDescription>
              Create a new department from an MJC subject.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Controller
                control={form.control}
                name="subjectId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid || isError}>
                    <FieldLabel required>Department of</FieldLabel>
                    <FieldContent>
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={fieldState.invalid || isError}
                        className="w-full"
                        disabled={isPending || isError}
                      >
                        <NativeSelectOption value="">
                          Select subject
                        </NativeSelectOption>
                        {mjcSubjects.map((subject) => (
                          <NativeSelectOption
                            key={subject.id}
                            value={subject.id}
                          >
                            {subject.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <FieldError
                        errors={[
                          fieldState.error,
                          isError
                            ? {
                                message:
                                  error?.message || "Failed to load subjects",
                              }
                            : undefined,
                        ]}
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Code (optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. PHY-DEPT"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Description (optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Optional department description"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </div>

          {addDepartment.error ? (
            <FieldError>{addDepartment.error.message}</FieldError>
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
