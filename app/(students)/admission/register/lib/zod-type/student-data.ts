import * as z from 'zod'

export const studentDataZodSchema = z.object({
  // --- Identity (from enrollment, typically read-only) ---
  UAN: z.string().min(3, "UAN should be at least 3 characters long"),
  // registrationNumber: z.string().optional(),
  // universityRoll: z.string().optional(),
  // collegeRoll: z.string().min(1, "College Roll is required"),
  admissionNo: z.string().optional(),
  confidentialNo: z.string().optional(),
  meritType: z.enum(["1st", "2nd", "3rd", "Sports Merit", "Tribe Reserved", "Other", ""]).optional(),
  profileNo: z.string().optional(),

  // --- Personal Details ---
  name: z.string().min(3, "Name should be at least 3 characters long"),
  avatar: z.any().optional(),
  DOB: z.string().min(1, "Date of Birth is required"),
  AadharNumber: z.string().length(12, "Aadhar Number must be exactly 12 digits"),
  gender: z.enum(["Male", "Female", "Transgender", ""], { message: "Gender is required" }),
  fathersName: z.string().min(1, "Father's Name is required"),
  mothersName: z.string().min(1, "Mother's Name is required"),
  religion: z.string().min(1, "Religion is required"),
  caste: z.string().min(1, "Caste is required"),
  isMinority: z.boolean(),

  // --- Academic ---
  batch: z.string().min(1, "Batch is required"),
  currentSemesterCount: z.number().int().positive(),
  subMJC: z.string().min(1, "Major Subject (MJC) is required"),
  subMIC: z.array(z.string()),
  subMDC: z.array(z.string()),
  subSEC: z.array(z.string()),
  subVAC: z.array(z.string()),
})

export type StudentDataType = z.infer<typeof studentDataZodSchema>

export const academicDetailsZodSchema = z.object({
  // Higher Secondary School Records
  schoolName: z.string().min(1, "School name is required"),
  board: z.string().min(1, "Board is required"),
  obtainedMarks: z.number().min(0, "Obtained marks must be positive"),
  totalMarks: z.number().positive("Total marks must be positive"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
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
})

export type AcademicDetailsType = z.infer<typeof academicDetailsZodSchema>

export const documentsUploadZodSchema = z.object({
  Aadhar: z.any().refine((val) => val, "Aadhar card document is required"),
  cast: z.any().optional(),
  domicile: z.any().optional(),
  income: z.any().optional(),
  pwd: z.any().optional(),
  previousLC: z.any().refine((val) => val, "Leaving Certificate is required"),
  previousMigration: z.any().refine((val) => val, "Migration Certificate is required"),
  previousMarksheet: z.any().refine((val) => val, "Previous Marksheet is required"),
  photo: z.any().refine((val) => val, "Passport size photo is required"),
  signature: z.any().refine((val) => val, "Signature is required"),
})

export type DocumentsUploadType = z.infer<typeof documentsUploadZodSchema>