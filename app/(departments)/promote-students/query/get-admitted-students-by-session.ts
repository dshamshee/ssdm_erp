import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAdmittedStudentsBySession } from "@/app/(departments)/promote-students/lib/action";

export const getAdmittedStudentsBySessionQuery = (
  sessionId: string | null,
) =>
  queryOptions({
    queryKey: ["admitted-students", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await getAdmittedStudentsBySession(sessionId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: !!sessionId,
    retry: false,
  });

export const useGetAdmittedStudentsBySession = (
  sessionId: string | null,
) => {
  return useQuery(getAdmittedStudentsBySessionQuery(sessionId));
};
