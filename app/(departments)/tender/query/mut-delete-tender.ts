import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTender } from "../lib/action";

export function useDeleteTender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteTender(id);
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
