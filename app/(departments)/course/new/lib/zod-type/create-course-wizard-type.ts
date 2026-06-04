import { z } from "zod";

export const COURSE_TYPES = [
  "UG Regular",
  "UG Part Time",
  "UG Vocational",
  "PG Regular",
  "PG Part Time",
  "PG Vocational",
] as const;

export const COURSE_DURATIONS = [2, 3, 4, 5, 6, 7, 8] as const;

// ── Step 1: Course Identity ──────────────────────────────────────────────────
export const courseIdentitySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("new"),
    name: z.string().min(1, "Course name is required").max(50),
    code: z.string().min(1, "Course code is required").max(10),
    type: z.enum(COURSE_TYPES, { message: "Select a valid course type" }),
    description: z.string().min(1, "Description is required").max(255),
    departmentId: z.string().min(1, "Department is required"),
    duration: z.coerce.number().int().min(2).max(8),
  }),
  z.object({
    mode: z.literal("existing"),
    courseId: z.string().min(1, "Select an existing course"),
  }),
]);

export type CourseIdentitySchema = z.infer<typeof courseIdentitySchema>;

// ── Step 2: Batch / Session ──────────────────────────────────────────────────
export const batchSessionSchema = z.object({
  sessionId: z.string().min(1, "Academic session is required"),
});

export type BatchSessionSchema = z.infer<typeof batchSessionSchema>;

// ── Step 3: Subjects ─────────────────────────────────────────────────────────
export const semesterSubjectsSchema = z.object({
  sameForAll: z.boolean(),
  // key = semesterIndex (0-based), value = array of subjectIds
  assignments: z.record(z.string(), z.array(z.string())),
});

export type SemesterSubjectsSchema = z.infer<typeof semesterSubjectsSchema>;

// ── Step 4: Fees ─────────────────────────────────────────────────────────────
export const feeRowSchema = z.object({
  institution: z.coerce.number().min(0).default(0),
  university: z.coerce.number().min(0).default(0),
  practical: z.coerce.number().min(0).default(0),
  cultural: z.coerce.number().min(0).default(0),
  sports: z.coerce.number().min(0).default(0),
  miscellaneous: z.coerce.number().min(0).default(0),
  late: z.coerce.number().min(0).default(0),
});

export const semesterFeesSchema = z.object({
  sameForAll: z.boolean(),
  fees: z.record(z.string(), feeRowSchema),
});

export type SemesterFeesSchema = z.infer<typeof semesterFeesSchema>;
export type FeeRowSchema = z.infer<typeof feeRowSchema>;

// ── Full wizard payload (sent on final submit) ───────────────────────────────
export const createCourseWizardSchema = z.object({
  identity: courseIdentitySchema,
  session: batchSessionSchema,
  subjects: semesterSubjectsSchema,
  fees: semesterFeesSchema,
});

export type CreateCourseWizardSchema = z.infer<typeof createCourseWizardSchema>;
