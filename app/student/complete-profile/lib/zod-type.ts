import * as z from "zod";

export const completeProfileSchema = z.object({
  // Personal Details
  DOB: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  AadharNumber: z
    .string()
    .length(12, "Aadhar Number must be exactly 12 digits")
    .regex(/^\d+$/, "Aadhar Number must contain only digits"),
  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  personalEmail: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase()),
  gender: z.enum(["Male", "Female", "Transgender"], {
    message: "Gender is required",
  }),
  mothersName: z.string().min(1, "Mother's name is required"),
  religion: z.enum(["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"], {
    message: "Religion is required",
  }),
  caste: z.enum(["GEN", "BC", "EBC", "SC", "ST", "OTHER"], {
    message: "Caste is required",
  }),
  reservation: z.string().optional(),
  isMinority: z.boolean(),
  ABCID: z.string().optional(),
  admissionType: z
    .enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER", ""])
    .optional(),

  // Address Details
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z
    .string()
    .length(6, "Pin code must be exactly 6 digits")
    .regex(/^\d+$/, "Pin code must contain only digits"),

  // Academic Details
  subMIC: z.string().min(1, "Minor Subject (MIC) is required"),
  subMDC: z.string().min(1, "Multidisciplinary Course (MDC) is required"),
  subAEC: z.string().min(1, "Ability Enhancement Course (AEC) is required"),
  subSEC: z.string().min(1, "Skill Enhancement Course (SEC) is required"),
  subVAC: z.string().min(1, "Value Added Course (VAC) is required"),
});

export type CompleteProfileSchema = z.infer<typeof completeProfileSchema>;
