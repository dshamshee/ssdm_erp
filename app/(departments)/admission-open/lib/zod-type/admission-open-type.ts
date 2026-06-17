import { z } from "zod";

export const addAdmissionOpenSchema = z
  .object({
    batchId: z.string().min(1, { message: "Batch is required" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    lateFee: z
      .number()
      .int()
      .min(0, { message: "Late fee must be non-negative" })
      .default(0),
    practicalFee: z
      .number()
      .int()
      .min(0, { message: "Practical fee must be non-negative" })
      .default(500),
    isDateExtended: z.boolean().default(false),
    extendedDate: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  )
  .refine(
    (data) => {
      if (!data.isDateExtended) {
        return true;
      }
      if (!data.extendedDate) {
        return false;
      }
      if (!data.endDate) {
        return true;
      }
      return new Date(data.extendedDate) >= new Date(data.endDate);
    },
    {
      message:
        "Extended date must be on or after end date when date is extended",
      path: ["extendedDate"],
    },
  );

export const updateAdmissionOpenSchema = z
  .object({
    id: z.string().min(1, { message: "Id is required" }),
    batchId: z.string().min(1, { message: "Batch is required" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    lateFee: z
      .number()
      .int()
      .min(0, { message: "Late fee must be non-negative" })
      .default(0),
    practicalFee: z
      .number()
      .int()
      .min(0, { message: "Practical fee must be non-negative" })
      .default(500),
    isDateExtended: z.boolean().default(false),
    extendedDate: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  )
  .refine(
    (data) => {
      if (!data.isDateExtended) {
        return true;
      }
      if (!data.extendedDate) {
        return false;
      }
      if (!data.endDate) {
        return true;
      }
      return new Date(data.extendedDate) >= new Date(data.endDate);
    },
    {
      message:
        "Extended date must be on or after end date when date is extended",
      path: ["extendedDate"],
    },
  );

export type AddAdmissionOpenSchema = z.infer<typeof addAdmissionOpenSchema>;
export type UpdateAdmissionOpenSchema = z.infer<
  typeof updateAdmissionOpenSchema
>;
