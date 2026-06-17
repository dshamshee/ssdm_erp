import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotice } from "../lib/action";
import type { UpdateNoticeSchema } from "../lib/zod-type/notice-type";

export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateNoticeSchema) => {
      const res = await updateNotice(input);
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
