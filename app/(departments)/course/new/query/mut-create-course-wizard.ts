import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourseWizard } from "../lib/action";
import type { CreateCourseWizardSchema } from "../lib/zod-type/create-course-wizard-type";

export function useCreateCourseWizard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCourseWizardSchema) => {
      const res = await createCourseWizard(input);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["batches-by-course"] });
    },
  });
}
