import { queryOptions } from "@tanstack/react-query";
import { fetchCourseById } from "../lib/action";

export function getCourseDetails({ id }: { id: string }) {
  return queryOptions({
    queryKey: [
      "course-details",
      id,
    ],
    queryFn: async () => {
      const res = await fetchCourseById(id);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}