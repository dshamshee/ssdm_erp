import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAcademicSession } from "../lib/action";
import type { AddAcademicSessionSchema } from "../lib/zod-type/academic-session-type";

export function useAddAcademicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddAcademicSessionSchema) => {
      const res = await addAcademicSession(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
    },
  });
}
