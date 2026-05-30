"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
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
import { Switch } from "@/components/ui/switch";
import {
  type AddSubjectSchema,
  addSubjectSchema,
  SUBJECT_TYPES,
} from "../lib/zod-type/subject-type";
import { useAddSubject } from "../query/mut-add-subject";

export function AddSubjectSheet() {
  const [open, setOpen] = useState(false);
  const addSubject = useAddSubject();

  const form = useForm<AddSubjectSchema>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "MJC",
      hasPractical: false,
      practicalFee: undefined,
    },
  });

  const hasPractical = useWatch({
    control: form.control,
    name: "hasPractical",
  });

  async function onSubmit(values: AddSubjectSchema) {
    await addSubject.mutateAsync(values);
    form.reset({
      name: "",
      code: "",
      type: "MJC",
      hasPractical: false,
      practicalFee: undefined,
    });
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Add Subject
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[700px] lg:w-[800px] px-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 h-full"
        >
          <SheetHeader>
            <SheetTitle>Add Subject</SheetTitle>
            <SheetDescription>
              Create a new subject for your curriculum.
            </SheetDescription>
          </SheetHeader>

          <FieldGroup className="flex-1 overflow-y-auto">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Subject Name</FieldLabel>
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
                  <FieldLabel>Subject Code</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="e.g. PHY101"
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
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Subject Type</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      {SUBJECT_TYPES.map((type) => (
                        <NativeSelectOption key={type} value={type}>
                          {type}
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
              name="hasPractical"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel className="!mt-0">Has Practical?</FieldLabel>
                </Field>
              )}
            />

            {hasPractical && (
              <Controller
                control={form.control}
                name="practicalFee"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Practical Fee</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        placeholder="Enter practical fee"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            )}

            {addSubject.error ? (
              <FieldError>{addSubject.error.message}</FieldError>
            ) : null}
          </FieldGroup>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
