import * as z from 'zod'

export const verifyStudentUANZodSchema = z.object({
  uan: z
    .string()
    .min(3, "UAN number must be at least 3 characters long")
    .max(15, "UAN number must be at most 15 characters long"),
  // email: z.email("Invalid email address"),
  subMJC: z.string().min(3, "MIC Subject must be at least 3 charecters long")
})

export type VerifyStudentUANType = z.infer<typeof verifyStudentUANZodSchema>