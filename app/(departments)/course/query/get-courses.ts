import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAllCourses } from "@/app/(departments)/course/lib/action";

export const getCoursesQuery = () =>
  queryOptions({
    queryKey: [
      "courses",
    ],
    queryFn: async () => {
      const res = await fetchAllCourses();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetCourses = () => {
  return useQuery(getCoursesQuery());
};
