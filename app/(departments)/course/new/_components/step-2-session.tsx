"use client";

import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";

interface Step2Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  semesterLabels: string[];
}

export function Step2Session({ form, semesterLabels }: Step2Props) {
  const {
    data: sessions = [],
    isPending,
    isError,
    error,
  } = useGetAcademicSessions();

  return (
    <div className="flex flex-col gap-6">
      <Controller
        control={form.control}
        name="session.sessionId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || isError}>
            <FieldLabel required>Academic Session</FieldLabel>
            <FieldContent>
              <NativeSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid || isError}
                className="w-full"
                disabled={isPending || isError}
              >
                <NativeSelectOption value="">
                  Select session…
                </NativeSelectOption>
                {sessions.map((s) => (
                  <NativeSelectOption key={s.id} value={s.id}>
                    {s.name}
                    {s.isActive ? " (Active)" : ""}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                errors={[
                  fieldState.error,
                  isError
                    ? { message: error?.message ?? "Failed to load sessions" }
                    : undefined,
                ]}
              />
            </FieldContent>
          </Field>
        )}
      />

      {/* Batch summary */}
      <div className="rounded-xl border border-dashed bg-muted/30 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <CalendarIcon className="size-3" />
          Batch will generate these semesters
        </div>
        <div className="flex flex-wrap gap-1.5">
          {semesterLabels.map((label) => (
            <Badge key={label} variant="outline" className="text-[10px]">
              {label}
            </Badge>
          ))}
          {semesterLabels.length === 0 && (
            <span className="text-xs text-muted-foreground">
              Set duration in Step 1 to preview semesters
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
