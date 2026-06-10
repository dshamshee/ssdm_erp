"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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

  const form = useForm<AddDepartmentSchema>({
    resolver: zodResolver(addDepartmentSchema) as never,
    defaultValues: { name: "", code: "", description: "" },
  });

  async function onSubmit(values: AddDepartmentSchema) {
    try {
      await addDepartment.mutateAsync(values);
      form.reset({ name: "", code: "", description: "" });
      setOpen(false);
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.toLowerCase().includes("code")) {
        form.setError("code", { type: "manual", message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("name")) {
        form.setError("name", { type: "manual", message: errorMessage });
      }
    }
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
              Create a new department by entering its name.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel required>Department Name</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="e.g. Physics"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
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
                      <FieldError errors={[fieldState.error]} />
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
                      <FieldError errors={[fieldState.error]} />
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
