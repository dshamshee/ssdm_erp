import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDepartment } from "@/app/(departments)/department/lib/action";
import type { AddDepartmentSchema } from "@/app/(departments)/department/lib/zod-type/add-department-type";

export const useAddDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddDepartmentSchema) => {
      const res = await addDepartment(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
