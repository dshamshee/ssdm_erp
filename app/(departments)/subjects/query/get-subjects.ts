import { queryOptions, useQuery } from "@tanstack/react-query";
import { getSubjects } from "@/app/(departments)/subjects/lib/action";

export const getSubjectsQuery = () =>
  queryOptions({
    queryKey: ["subjects"],
    queryFn: async () => {
      const res = await getSubjects();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetSubjects = () => {
  return useQuery(getSubjectsQuery());
};
