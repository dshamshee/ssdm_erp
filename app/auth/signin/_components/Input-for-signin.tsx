"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import type { SigninSchema } from "../lib/zod-type/signin-type";

export function InputForSignin({
  form,
}: {
  form: UseFormReturn<SigninSchema>;
}) {
  return (
    <>
      <Controller
        control={form.control}
        name="identifier"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Application No. / University Roll No.</FieldLabel>
            <FieldContent>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your Application No. or University Roll No."
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel required>Password</FieldLabel>
            <FieldContent>
              <PasswordInput {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  );
}
