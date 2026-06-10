import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStudent } from "../lib/action";
import { toast } from "sonner";
import type { RegisterStudentPayload } from "../lib/zod-type/register-student-type";

export function useMutRegisterStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterStudentPayload) => {
      const res = await registerStudent(payload);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrolled_student"] });
      toast.success("Student registered successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
