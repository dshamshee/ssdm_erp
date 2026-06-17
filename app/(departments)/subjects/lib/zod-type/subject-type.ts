import { z } from "zod";

export const SUBJECT_CATEGORIES = ["SCIENCE", "COMMERCE", "ARTS", "GENERAL"] as const;

export const addSubjectSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required" }),
  code: z.string().min(1, { message: "Subject code is required" }),
  category: z.enum(SUBJECT_CATEGORIES, { message: "Select a valid category" }),
  hasPractical: z.boolean().default(false),
});

export const updateSubjectSchema = z.object({
  id: z.string().min(1, { message: "Subject id is required" }),
  name: z.string().min(1, { message: "Subject name is required" }),
  code: z.string().min(1, { message: "Subject code is required" }),
  category: z.enum(SUBJECT_CATEGORIES, { message: "Select a valid category" }),
  hasPractical: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type AddSubjectSchema = z.infer<typeof addSubjectSchema>;
export type UpdateSubjectSchema = z.infer<typeof updateSubjectSchema>;
