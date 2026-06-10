import * as z from "zod";

export const newCourseSchema = z.object({
  name: z
    .string()
    .min(3, "Name is must at least 3 Characters long")
    .max(30, "Name is must be at most 30 Characters long"),
  code: z
    .string()
    .min(3, "Code is must at least 3 Characters long")
    .max(10, "Code is must be at most 10 Characters long")
    .toUpperCase(),
  description: z
    .string()
    .min(5, "Description is must at least 5 Characters long")
    .max(100, "Description is must be at most 100 Characters long"),
  type: z.enum([
    "UG Regular",
    "UG Part Time",
    "UG Vocational",
    "PG Regular",
    "PG Part Time",
    "PG Vocational",
  ]),
  duration: z
    .number()
    .int()
    .positive()
    .min(2, "Duration is must be at least 2")
    .max(4, "Duration is must be at most 4"),
  // isActive: z.boolean().default(true)
});

export type NewCourseType = z.infer<typeof newCourseSchema>;
