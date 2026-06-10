import * as z from "zod";
import { studentDataZodSchema, academicDetailsZodSchema } from "./student-data";

// Server-side documents schema: only accepts Cloudinary URL strings (files are already uploaded)
const documentsUrlSchema = z.object({
  Aadhar: z.string().url("Aadhar document URL is required"),
  cast: z.string().url().optional().or(z.literal("")),
  domicile: z.string().url().optional().or(z.literal("")),
  income: z.string().url().optional().or(z.literal("")),
  pwd: z.string().url().optional().or(z.literal("")),
  previousLC: z.string().url("Leaving Certificate URL is required"),
  previousMigration: z.string().url("Migration Certificate URL is required"),
  previousMarksheet: z.string().url("Previous Marksheet URL is required"),
  photo: z.string().url("Photo URL is required"),
  signature: z.string().url("Signature URL is required"),
});

export const registerStudentSchema = z.object({
  personal: studentDataZodSchema,
  academic: academicDetailsZodSchema,
  documents: documentsUrlSchema,
});

export type RegisterStudentPayload = z.infer<typeof registerStudentSchema>;
