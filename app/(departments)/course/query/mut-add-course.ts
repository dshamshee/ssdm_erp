import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCourseWithSession } from "@/app/(departments)/course/lib/action";
import type { AddCourseSchema } from "@/app/(departments)/course/lib/zod-type/add-course-type";

export const useAddCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCourseSchema) => {
      const res = await addCourseWithSession(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
