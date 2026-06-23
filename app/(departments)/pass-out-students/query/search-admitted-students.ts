import { queryOptions, useQuery } from "@tanstack/react-query";
import { searchAdmittedStudents } from "@/app/(departments)/promote-students/lib/action";

export interface SearchFilters {
  query?: string;
  sessionId?: string;
  courseId?: string;
  departmentId?: string;
  semesterCount?: number;
  status?: string;
}

export const searchAdmittedStudentsQuery = (filters: SearchFilters) =>
  queryOptions({
    queryKey: ["admitted-students-search", filters],
    queryFn: async () => {
      const res = await searchAdmittedStudents(filters);
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to search students");
      }
      return res.data;
    },
    retry: false,
  });

export const useSearchAdmittedStudents = (filters: SearchFilters, enabled = true) => {
  return useQuery({
    ...searchAdmittedStudentsQuery(filters),
    enabled,
  });
};
