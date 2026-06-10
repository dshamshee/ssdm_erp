import * as z from "zod";

export const studentDataZodSchema = z.object({
  // --- Identity (from enrollment, typically read-only) ---
  UAN: z.string().min(3, "UAN should be at least 3 characters long"),
  registrationNumber: z.string().optional(),
  universityRoll: z.string().optional(),
  admissionNumber: z.string().optional(),
  confidentialNumber: z.string().optional(),
  profileNumber: z.string().optional(),
  admissionType: z
    .enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER", ""])
    .optional(),
  ABCID: z.string().optional(),

  // --- Personal Details ---
  name: z.string().min(3, "Name should be at least 3 characters long"),
  avatar: z.any().optional(),
  DOB: z.string().min(1, "Date of Birth is required"),
  AadharNumber: z
    .string()
    .length(12, "Aadhar Number must be exactly 12 digits"),
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Transgender", ""], {
    message: "Gender is required",
  }),
  fathersName: z.string().min(1, "Father's Name is required"),
  mothersName: z.string().min(1, "Mother's Name is required"),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  reservation: z.string().optional(),
  isMinority: z.boolean(),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().length(6, "PIN Code must be exactly 6 digits"),

  // --- Academic ---
  batch: z.string().min(1, "Batch is required"),
  currentSemesterCount: z.number().int().positive(),
  subMJC: z.string().min(1, "Major Subject (MJC) is required"),
  subMIC: z.array(z.string()),
  subMDC: z.array(z.string()),
  subAEC: z.array(z.string()),
  subSEC: z.array(z.string()),
  subVAC: z.array(z.string()),
});

export type StudentDataType = z.infer<typeof studentDataZodSchema>;

export const academicDetailsZodSchema = z.object({
  // Higher Secondary School Records
  schoolName: z.string().min(1, "School name is required"),
  board: z.string().min(1, "Board is required"),
  obtainedMarks: z.number().min(0, "Obtained marks must be positive"),
  totalMarks: z.number().positive("Total marks must be positive"),
  percentage: z
    .number()
    .min(0)
    .max(100, "Percentage must be between 0 and 100"),
  rollNo: z.string().min(1, "Roll number is required"),
  rollCode: z.string().min(1, "Roll code is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().length(6, "PIN Code must be exactly 6 digits"),

  // UG Records (optional)
  ugInstituteName: z.string().optional(),
  ugUniversityName: z.string().optional(),
  ugObtainedMarks: z.number().optional(),
  ugTotalMarks: z.number().optional(),
  ugPercentage: z.number().optional(),
  ugRollNo: z.string().optional(),
  ugAddress: z.string().optional(),
  ugCity: z.string().optional(),
  ugDistrict: z.string().optional(),
  ugState: z.string().optional(),
  ugPinCode: z.string().optional(),
});

export type AcademicDetailsType = z.infer<typeof academicDetailsZodSchema>;

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const documentFileSchema = (requiredMsg?: string) => {
  let schema = z.any();
  if (requiredMsg) {
    schema = schema.refine((val) => val, requiredMsg);
  }
  return schema.refine(
    (val) =>
      !val ||
      (val instanceof File && val.size <= MAX_FILE_SIZE) ||
      (typeof val === "string" && val.startsWith("http")),
    "File size must be under 1MB or must be an uploaded URL",
  );
};

export const documentsUploadZodSchema = z.object({
  Aadhar: documentFileSchema("Aadhar card document is required"),
  cast: documentFileSchema().optional(),
  domicile: documentFileSchema().optional(),
  income: documentFileSchema().optional(),
  pwd: documentFileSchema().optional(),
  previousLC: documentFileSchema("Leaving Certificate is required"),
  previousMigration: documentFileSchema("Migration Certificate is required"),
  previousMarksheet: documentFileSchema("Previous Marksheet is required"),
  photo: documentFileSchema("Passport size photo is required"),
  signature: documentFileSchema("Signature is required"),
});

export type DocumentsUploadType = z.infer<typeof documentsUploadZodSchema>;
