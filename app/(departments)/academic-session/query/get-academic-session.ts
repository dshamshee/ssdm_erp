import { queryOptions, useQuery } from "@tanstack/react-query";
import { getAcademicSessions } from "@/app/(departments)/academic-session/lib/action";

export const getAcademicSessionsQuery = () =>
  queryOptions({
    queryKey: [
      "academic-sessions",
    ],
    queryFn: async () => {
      const res = await getAcademicSessions();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetAcademicSessions = () => {
  return useQuery(getAcademicSessionsQuery());
};
