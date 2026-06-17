import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addNotice } from "../lib/action";
import type { AddNoticeSchema } from "../lib/zod-type/notice-type";

export function useAddNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddNoticeSchema) => {
      const res = await addNotice(input);
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
