import { z } from "zod";

export const signinSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type SigninSchema = z.infer<typeof signinSchema>;
