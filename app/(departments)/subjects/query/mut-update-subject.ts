import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubject } from "@/app/(departments)/subjects/lib/action";
import type { UpdateSubjectSchema } from "@/app/(departments)/subjects/lib/zod-type/subject-type";

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSubjectSchema) => {
      const res = await updateSubject(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
};
