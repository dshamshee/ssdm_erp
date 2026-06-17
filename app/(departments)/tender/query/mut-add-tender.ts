import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addTender } from "../lib/action";
import type { AddTenderSchema } from "../lib/zod-type/tender-type";

export function useAddTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTenderSchema) => {
      const res = await addTender(input);
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
