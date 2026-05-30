import { z } from "zod";

export const SUBJECT_TYPES = ["MJC", "MIC", "MDC", "SEC", "VAC"] as const;

export const subjectTypeEnum = z.enum(SUBJECT_TYPES);

export const addSubjectSchema = z.object({
  name: z.string().min(1, { message: "Subject name is required" }),
  code: z.string().min(1, { message: "Subject code is required" }),
  type: z.enum(SUBJECT_TYPES),
  hasPractical: z.boolean().default(false),
  practicalFee: z.number().optional().nullable(),
});

export const updateSubjectSchema = z.object({
  id: z.string().min(1, { message: "Subject id is required" }),
  name: z.string().min(1, { message: "Subject name is required" }),
  code: z.string().min(1, { message: "Subject code is required" }),
  type: z.enum(SUBJECT_TYPES),
  hasPractical: z.boolean().default(false),
  practicalFee: z.number().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type AddSubjectSchema = z.infer<typeof addSubjectSchema>;
export type UpdateSubjectSchema = z.infer<typeof updateSubjectSchema>;
