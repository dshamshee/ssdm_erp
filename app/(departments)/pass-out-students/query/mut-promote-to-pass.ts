import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promoteStudentsToPassed } from "@/app/(departments)/promote-students/lib/action";

export function useMutPromoteToPass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentIds: string[]) => {
      const res = await promoteStudentsToPassed(studentIds);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to promote students to Passed status");
      }
      return res.data as { promotedCount: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admitted-students"] });
      queryClient.invalidateQueries({ queryKey: ["admitted-students-search"] });
      toast.success(
        `Successfully promoted ${data.promotedCount} student${data.promotedCount !== 1 ? "s" : ""} to Passed status.`,
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
