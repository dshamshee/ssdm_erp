import { queryOptions } from "@tanstack/react-query";
import { fetchCoursesByDepartment } from "@/app/(departments)/department/lib/action";

export function getCoursesByDepartment(departmentId: string) {
  return queryOptions({
    queryKey: ["department-courses", departmentId],
    queryFn: async () => {
      const res = await fetchCoursesByDepartment(departmentId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
    enabled: !!departmentId,
  });
}
