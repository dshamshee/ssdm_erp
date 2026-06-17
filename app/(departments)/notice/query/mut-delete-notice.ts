import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotice } from "../lib/action";

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNotice(id);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
  });
}
