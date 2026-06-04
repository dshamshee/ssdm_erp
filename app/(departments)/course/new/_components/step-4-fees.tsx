"use client";

import { Controller, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { CoinsIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const FEE_FIELDS = [
  { key: "institution", label: "Institution" },
  { key: "university", label: "University" },
  { key: "practical", label: "Practical" },
  { key: "cultural", label: "Cultural" },
  { key: "sports", label: "Sports" },
  { key: "miscellaneous", label: "Miscellaneous" },
  { key: "late", label: "Late Fee" },
] as const;

interface Step4Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  semesterLabels: string[];
}

export function Step4Fees({ form, semesterLabels }: Step4Props) {
  const sameForAll: boolean = useWatch({
    control: form.control,
    name: "fees.sameForAll",
  });

  const copyToAll = () => {
    const first = form.getValues("fees.fees.0") ?? {};
    const updated: Record<string, unknown> = {};
    for (let i = 0; i < semesterLabels.length; i++) {
      updated[String(i)] = { ...first };
    }
    form.setValue("fees.fees", updated);
  };

  const rows = sameForAll
    ? [{ key: "0", label: "All Semesters" }]
    : semesterLabels.map((label, i) => ({ key: String(i), label }));

  return (
    <div className="flex flex-col gap-5">
      {/* Toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Same fee for all semesters</p>
          <p className="text-xs text-muted-foreground">
            Set once and apply to every semester
          </p>
        </div>
        <Controller
          control={form.control}
          name="fees.sameForAll"
          render={({ field }) => (
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              onClick={() => field.onChange(!field.value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                field.value ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                  field.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          )}
        />
      </div>

      {!sameForAll && semesterLabels.length > 1 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToAll}
          className="self-start"
        >
          <CopyIcon data-icon="inline-start" className="size-3" />
          Copy Semester I to all
        </Button>
      )}

      {/* Fee panels */}
      <div className="flex flex-col gap-4">
        {rows.map(({ key, label }) => (
          <FeePanel
            key={key}
            fieldKey={key}
            label={label}
            form={form}
          />
        ))}
      </div>
    </div>
  );
}

interface FeePanelProps {
  fieldKey: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

function FeePanel({ fieldKey, label, form }: FeePanelProps) {
  const fees = useWatch({
    control: form.control,
    name: `fees.fees.${fieldKey}`,
  }) ?? {};

  const total = FEE_FIELDS.reduce((acc, { key }) => {
    return acc + (Number(fees[key]) || 0);
  }, 0);

  return (
    <div className="rounded-xl border bg-background p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CoinsIcon className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <span className="text-xs font-semibold text-primary">
          Total: ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEE_FIELDS.map(({ key, label: fieldLabel }) => (
          <Controller
            key={key}
            control={form.control}
            name={`fees.fees.${fieldKey}.${key}`}
            render={({ field }) => (
              <Field>
                <FieldLabel>{fieldLabel}</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      type="number"
                      min={0}
                      className="pl-7"
                      placeholder="0"
                      {...field}
                      value={field.value ?? 0}
                    />
                  </div>
                </FieldContent>
              </Field>
            )}
          />
        ))}
      </div>
    </div>
  );
}
