import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, type UseFormReturn } from "react-hook-form"
import { NewSemesterType } from "../lib/zod-type/new-semester"

export const InputForSemester = ({ form }: { form: UseFormReturn<NewSemesterType> })=>{

    return(
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
                name="semesterNumber"
                render={({ field, fieldState }) => (
                <Field>
                    <FieldLabel requiredLable>Semester Count</FieldLabel>
                    <FieldContent>
                    <Input {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} type="number" min={1} max={8}/>
                    <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                </Field>
                )}
            />
        </>
    )
}