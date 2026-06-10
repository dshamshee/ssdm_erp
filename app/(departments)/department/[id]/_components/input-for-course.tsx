"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { NewCourseType } from "../lib/zod-type/new-course-type";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const InputForCourse = ({
  form,
}: {
  form: UseFormReturn<NewCourseType>;
}) => {
  return (
    <>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Name</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Code</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Description</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="type"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Type</FieldLabel>
            <FieldContent>
              {/* <Input {...field} aria-invalid={fieldState.invalid} /> */}
              <Select
                {...field}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UG Regular">UG Regular</SelectItem>
                  <SelectItem value="UG Part Time">UG Part Time</SelectItem>
                  <SelectItem value="UG Vocational">UG Vocational</SelectItem>
                  <SelectItem value="PG Regular">PG Regular</SelectItem>
                  <SelectItem value="PG Part Time">PG Part Time</SelectItem>
                  <SelectItem value="PG Vocational">PG Vocational</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="duration"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Duration</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  );
};
