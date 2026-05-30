"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import {
  getDefaultEndYear,
  getEndYearFromDate,
  getEndYearOptions,
  getStartYearFromDate,
  getStartYearOptions,
} from "../lib/session-year";
import {
  type UpdateAcademicSessionSchema,
  updateAcademicSessionSchema,
} from "../lib/zod-type/academic-session-type";
import { useUpdateAcademicSession } from "../query/mut-update-academic-session";
import type { AcademicSessionRow } from "./column";

export function EditSessionDialog({
  session,
}: {
  session: AcademicSessionRow;
}) {
  const [open, setOpen] = useState(false);
  const updateSession = useUpdateAcademicSession();
  const defaultStartYear = getStartYearFromDate(session.startDate);
  const defaultEndYear = getEndYearFromDate(session.endDate);
  const form = useForm<UpdateAcademicSessionSchema>({
    resolver: zodResolver(updateAcademicSessionSchema),
    defaultValues: {
      id: session.id,
      startYear: defaultStartYear,
      endYear: defaultEndYear,
      isActive: session.isActive,
    },
  });
  const startYear = useWatch({
    control: form.control,
    name: "startYear",
  });
  const endYear = useWatch({
    control: form.control,
    name: "endYear",
  });
  const startYearValue = startYear ?? defaultStartYear;
  const endYearValue = endYear ?? defaultEndYear;
  const startYearOptions = getStartYearOptions(startYearValue);
  const endYearOptions = getEndYearOptions(startYearValue, endYearValue);

  useEffect(() => {
    if (endYearValue <= startYearValue) {
      form.setValue("endYear", getDefaultEndYear(startYearValue), {
        shouldValidate: true,
      });
    }
  }, [endYearValue, form, startYearValue]);

  async function onSubmit(values: UpdateAcademicSessionSchema) {
    await updateSession.mutateAsync(values);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          form.reset({
            id: session.id,
            startYear: defaultStartYear,
            endYear: defaultEndYear,
            isActive: session.isActive,
          });
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <PencilIcon data-icon="inline-start" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update the start and end year or disable this academic session.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              control={form.control}
              name="startYear"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Starting Year</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={String(field.value)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="">
                        Select year
                      </NativeSelectOption>
                      {startYearOptions.map((year) => (
                        <NativeSelectOption key={year} value={String(year)}>
                          {year}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
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
              name="endYear"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Ending Year</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={String(field.value)}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <NativeSelectOption value="">
                        Select year
                      </NativeSelectOption>
                      {endYearOptions.map((year) => (
                        <NativeSelectOption key={year} value={String(year)}>
                          {year}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
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
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel className="!mt-0">Active session</FieldLabel>
                </Field>
              )}
            />
            {updateSession.error ? (
              <FieldError>{updateSession.error.message}</FieldError>
            ) : null}
          </FieldGroup>

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
