import { z } from "zod";

export const addTenderSchema = z
  .object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional().nullable(),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    document: z.string().min(1, { message: "Document is required" }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

export const updateTenderSchema = z
  .object({
    id: z.string().min(1, { message: "Id is required" }),
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional().nullable(),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    document: z.string().min(1, { message: "Document is required" }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date must be on or after start date", path: ["endDate"] },
  );

export type AddTenderSchema = z.infer<typeof addTenderSchema>;
export type UpdateTenderSchema = z.infer<typeof updateTenderSchema>;
