"use client";

import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { BuildingIcon, PlusCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { getCoursesQuery } from "@/app/(departments)/course/query/get-courses";
import {
  COURSE_DURATIONS,
  COURSE_TYPES,
} from "../lib/zod-type/create-course-wizard-type";

interface Step1Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  mode: "new" | "existing";
  onModeChange: (m: "new" | "existing") => void;
}

export function Step1CourseIdentity({ form, mode, onModeChange }: Step1Props) {
  const { data: departments = [], isPending: deptPending } =
    useQuery(getDepartment());
  const { data: courses = [], isPending: coursesPending } =
    useQuery(getCoursesQuery());

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("new")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
            mode === "new"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <PlusCircleIcon className="size-4" />
          Create New Course
        </button>
        <button
          type="button"
          onClick={() => onModeChange("existing")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
            mode === "existing"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <BuildingIcon className="size-4" />
          Add Batch to Existing
        </button>
      </div>

      {mode === "existing" ? (
        <Controller
          control={form.control}
          name="identity.courseId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>Select Existing Course</FieldLabel>
              <FieldContent>
                <NativeSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                  disabled={coursesPending}
                >
                  <NativeSelectOption value="">
                    Choose a course…
                  </NativeSelectOption>
                  {courses.map((c) => (
                    <NativeSelectOption key={c.id} value={c.id}>
                      {c.name} ({c.code}) — {c.department?.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="identity.name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Course Name</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="e.g. Bachelor of Computer Applications"
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
            name="identity.code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Code</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="e.g. BCA"
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
            name="identity.type"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Type</FieldLabel>
                <FieldContent>
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    {COURSE_TYPES.map((t) => (
                      <NativeSelectOption key={t} value={t}>
                        {t}
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
            name="identity.duration"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel required>Duration (Years)</FieldLabel>
                <FieldContent>
                  <NativeSelect
                    value={String(field.value ?? 4)}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    {COURSE_DURATIONS.map((d) => (
                      <NativeSelectOption key={d} value={String(d)}>
                        {d} Years ({d * 2} Semesters)
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
            name="identity.departmentId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel required>Department</FieldLabel>
                <FieldContent>
                  <NativeSelect
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                    disabled={deptPending}
                  >
                    <NativeSelectOption value="">
                      Select department…
                    </NativeSelectOption>
                    {departments.map((d) => (
                      <NativeSelectOption key={d.id} value={d.id}>
                        Department of {d.name}
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
            name="identity.description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel required>Description</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="Short overview of the course"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />

          {/* Semester preview */}
          {form.watch("identity.duration") && (
            <div className="sm:col-span-2 rounded-xl border border-dashed bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Auto-generated semesters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  { length: Number(form.watch("identity.duration") ?? 0) * 2 },
                  (_, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      Sem {["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI"][i] ?? i + 1}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
