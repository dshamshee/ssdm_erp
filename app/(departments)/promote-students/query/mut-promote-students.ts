import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { promoteStudentsBySession } from "@/app/(departments)/promote-students/lib/action";

export function useMutPromoteStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await promoteStudentsBySession(sessionId);
      if (!res.success || !res.data) throw new Error(res.message || "Failed to promote students");
      return res.data as { promotedCount: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admitted-students"] });
      toast.success(
        `Successfully promoted ${data.promotedCount} student${data.promotedCount !== 1 ? "s" : ""} to the next semester.`,
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
