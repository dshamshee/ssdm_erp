import { Controller, type UseFormReturn } from "react-hook-form";
import { VerifyStudentUANType } from "../lib/zod-type/verify-student-uan";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchActiveSubjects } from "../lib/action";

export const InputForVerification = ({
  form,
}: {
  form: UseFormReturn<VerifyStudentUANType>;
}) => {
  const [subjects, setSubjects] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSubjects().then((res) => {
      if (res.success && res.subjects) {
        setSubjects(res.subjects);
      }
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Controller
        control={form.control}
        name="uan"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel requiredLable>UAN</FieldLabel>
            <FieldContent>
              <Input
                {...field}
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your UAN"
              />
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
              <select
                {...field}
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
                disabled={loading}
                className="h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
              >
                <option value="">
                  {loading ? "Loading subjects..." : "Select MJC Subject"}
                </option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </option>
                ))}
              </select>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  );
};
