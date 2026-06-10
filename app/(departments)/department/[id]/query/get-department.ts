import { queryOptions } from "@tanstack/react-query";
import { fetchCoursesByDepartment } from "../lib/action";

export function getCourses({ id }: { id: string }) {
  return queryOptions({
    queryKey: ["courses", id],
    queryFn: async () => {
      const res = await fetchCoursesByDepartment(id);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
