import { z } from "zod";

export const signinSchema = z.object({
  identifier: z.string().min(1, { message: "Email or UAN is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(4, { message: "Password must be at least 8 characters" }),
});

export type SigninSchema = z.infer<typeof signinSchema>;
