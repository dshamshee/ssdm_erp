"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
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
import {
  getDefaultEndYear,
  getEndYearOptions,
  getStartYearOptions,
} from "../lib/session-year";
import {
  type AddAcademicSessionSchema,
  addAcademicSessionSchema,
} from "../lib/zod-type/academic-session-type";
import { useAddAcademicSession } from "../query/mut-add-academic-session";

export function AddSessionDialog() {
  const [open, setOpen] = useState(false);
  const addSession = useAddAcademicSession();
  const currentYear = new Date().getFullYear();
  const defaultEndYear = getDefaultEndYear(currentYear);
  const form = useForm<AddAcademicSessionSchema>({
    resolver: zodResolver(addAcademicSessionSchema),
    defaultValues: { startYear: currentYear, endYear: defaultEndYear },
  });
  const startYear = useWatch({ control: form.control, name: "startYear" });
  const endYear = useWatch({ control: form.control, name: "endYear" });
  const startYearValue = startYear ?? currentYear;
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

  async function onSubmit(values: AddAcademicSessionSchema) {
    await addSession.mutateAsync(values);
    form.reset({ startYear: currentYear, endYear: defaultEndYear });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <DialogHeader>
            <DialogTitle>Add Session</DialogTitle>
            <DialogDescription>
              Select a start and end year. The session name and dates are
              generated automatically.
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
                    <FieldError errors={[fieldState.error]} />
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
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
            {addSession.error ? (
              <FieldError>{addSession.error.message}</FieldError>
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
