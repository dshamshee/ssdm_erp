"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { useGetBatches } from "../query/get-batches";

interface AdmissionOpenFormFieldsProps {
  // biome-ignore lint/suspicious/noExplicitAny: form needs to accept both add and update schemas
  form: UseFormReturn<any>;
}

export function AdmissionOpenFormFields({
  form,
}: AdmissionOpenFormFieldsProps) {
  const { data: batches = [], isPending } = useGetBatches();
  const isDateExtended = form.watch("isDateExtended");

  return (
    <div className="grid gap-3">
      <Controller
        control={form.control}
        name="batchId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Batch / Course</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
                className="w-full"
                disabled={isPending}
              >
                <NativeSelectOption value="">
                  {isPending ? "Loading batches..." : "Select Batch"}
                </NativeSelectOption>
                {batches.map((batch) => (
                  <NativeSelectOption key={batch.id} value={batch.id}>
                    {batch.course.name} ({batch.academicSession.name})
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="startDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>Start Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>End Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="lateFee"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Late Fee (₹)</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="practicalFee"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Practical Fee (₹)</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={field.value ?? 500}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <span className="text-sm font-semibold">Extend Date</span>
          <p className="text-xs text-muted-foreground">
            Enable to set an extended deadline for this admission batch
          </p>
        </div>
        <Controller
          control={form.control}
          name="isDateExtended"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>

      {isDateExtended && (
        <Controller
          control={form.control}
          name="extendedDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>Extended End Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      )}
    </div>
  );
}
