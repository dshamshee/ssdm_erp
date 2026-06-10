import { departmentTable } from "@/lib/db/schema";

export interface ReturnType {
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
  statusCode?: number;
}
