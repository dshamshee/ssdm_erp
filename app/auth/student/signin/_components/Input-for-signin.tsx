"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { SigninSchema } from "../lib/zod-type/signin-type";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function InputForSingin({ form }: { form: UseFormReturn<SigninSchema> }) {
  return (
    <>
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>Email</FieldLabel>
            <FieldContent>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                type="email"
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
            <FieldLabel requiredLable>Password</FieldLabel>
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
