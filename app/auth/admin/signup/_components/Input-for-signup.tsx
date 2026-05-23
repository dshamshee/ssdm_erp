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
import type { SignupSchema } from "../lib/zod-type/signup-type";

export function InputForSignup({
  form,
}: {
  form: UseFormReturn<SignupSchema>;
}) {
  return (
    <>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>Name</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
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
      <Controller
        control={form.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>Confirm password</FieldLabel>
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
