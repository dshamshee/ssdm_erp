import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTender } from "../lib/action";
import type { UpdateTenderSchema } from "../lib/zod-type/tender-type";

export function useUpdateTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTenderSchema) => {
      const res = await updateTender(input);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenders"] });
    },
  });
}
