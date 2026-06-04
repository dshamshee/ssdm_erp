"use client";

import { Controller, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { BookOpenIcon, CopyIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetSubjects } from "@/app/(departments)/subjects/query/get-subjects";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface Step3Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  semesterLabels: string[];
}

export function Step3Subjects({ form, semesterLabels }: Step3Props) {
  const { data: subjects = [], isPending } = useGetSubjects();
  const sameForAll: boolean = useWatch({
    control: form.control,
    name: "subjects.sameForAll",
  });

  const copyToAll = () => {
    const first = form.getValues("subjects.assignments.0") ?? [];
    const updated: Record<string, string[]> = {};
    for (let i = 0; i < semesterLabels.length; i++) {
      updated[String(i)] = [...first];
    }
    form.setValue("subjects.assignments", updated);
  };

  const rows = sameForAll
    ? [{ key: "0", label: "All Semesters" }]
    : semesterLabels.map((label, i) => ({ key: String(i), label }));

  return (
    <div className="flex flex-col gap-5">
      {/* Toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Same subjects for all semesters</p>
          <p className="text-xs text-muted-foreground">
            Assign once and apply to every semester
          </p>
        </div>
        <Controller
          control={form.control}
          name="subjects.sameForAll"
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

      {/* Semester rows */}
      <div className="flex flex-col gap-3">
        {rows.map(({ key, label }) => (
          <SubjectRow
            key={key}
            fieldKey={key}
            label={label}
            subjects={subjects}
            isPending={isPending}
            form={form}
          />
        ))}
      </div>
    </div>
  );
}

interface SubjectRowProps {
  fieldKey: string;
  label: string;
  subjects: { id: string; name: string; code: string; type: string | null }[];
  isPending: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

function SubjectRow({ fieldKey, label, subjects, isPending, form }: SubjectRowProps) {
  const selected: string[] = useWatch({
    control: form.control,
    name: `subjects.assignments.${fieldKey}`,
  }) ?? [];

  const toggle = (id: string) => {
    const current = form.getValues(`subjects.assignments.${fieldKey}`) ?? [];
    const next = current.includes(id)
      ? current.filter((s: string) => s !== id)
      : [...current, id];
    form.setValue(`subjects.assignments.${fieldKey}`, next);
  };

  return (
    <div className="rounded-xl border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BookOpenIcon className="size-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">{label}</span>
        <Badge variant="secondary" className="text-[10px]">
          {selected.length} selected
        </Badge>
      </div>
      {isPending ? (
        <p className="text-xs text-muted-foreground">Loading subjects…</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {subjects.map((s) => {
            const isSelected = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted/30 text-foreground hover:bg-muted/60"
                }`}
              >
                {s.name}
                <span className="opacity-60">{s.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
