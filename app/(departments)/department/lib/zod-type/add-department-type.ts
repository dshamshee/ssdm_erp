import { z } from "zod";

export const addDepartmentSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject is required" }),
  code: z
    .string()
    .max(10, { message: "Code cannot be more than 10 characters" })
    .optional(),
  description: z
    .string()
    .max(100, { message: "Description cannot be more than 100 characters" })
    .optional(),
});

export type AddDepartmentSchema = z.infer<typeof addDepartmentSchema>;