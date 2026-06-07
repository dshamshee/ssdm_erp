import { Controller, type UseFormReturn } from "react-hook-form";
import { VerifyStudentUANType } from '../lib/zod-type/verify-student-uan'
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
export const InputForVerification = ({ form }: { form: UseFormReturn<VerifyStudentUANType> }) => {

  return (
    <>
      <Controller
        control={form.control}
        name="uan"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>UAN</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} placeholder="Enter your UAN" />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />


      <Controller
        control={form.control}
        name="subMJC"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>MJC Subject</FieldLabel>
            <FieldContent>
              <Input {...field} aria-invalid={fieldState.invalid} placeholder="Enter your MIC Subject" />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  )
}