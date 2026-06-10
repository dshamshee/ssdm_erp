import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAcademicSession } from "../lib/action";
import type { UpdateAcademicSessionSchema } from "../lib/zod-type/academic-session-type";

export function useUpdateAcademicSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAcademicSessionSchema) => {
      const res = await updateAcademicSession(input);
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
