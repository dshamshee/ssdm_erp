import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubject } from "@/app/(departments)/subjects/lib/action";
import type { AddSubjectSchema } from "@/app/(departments)/subjects/lib/zod-type/subject-type";

export const useAddSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddSubjectSchema) => {
      const res = await addSubject(input);
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
