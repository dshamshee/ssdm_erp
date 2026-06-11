import { z } from "zod";

const academicSessionYearSchema = z
  .number()
  .int({ message: "Select a valid year" })
  .min(2000, { message: "Select a valid year" })
  .max(2100, { message: "Select a valid year" });

export const addAcademicSessionSchema = z
  .object({
    startYear: academicSessionYearSchema,
    endYear: academicSessionYearSchema,
  })
  .refine((data) => data.endYear > data.startYear, {
    message: "End year must be after the start year",
    path: ["endYear"],
  });

export const updateAcademicSessionSchema = z
  .object({
    id: z.string().min(1, { message: "Session id is required" }),
    startYear: academicSessionYearSchema,
    endYear: academicSessionYearSchema,
  })
  .refine((data) => data.endYear > data.startYear, {
    message: "End year must be after the start year",
    path: ["endYear"],
  });

export type AddAcademicSessionSchema = z.infer<typeof addAcademicSessionSchema>;
export type UpdateAcademicSessionSchema = z.infer<
  typeof updateAcademicSessionSchema
>;
