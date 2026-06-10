import { queryOptions } from "@tanstack/react-query";
import { fetchEnrolledStudent } from "../lib/action";

export function getEnrolledStudent({
  batch,
  UAN,
  MJC,
}: {
  batch: string;
  UAN: string;
  MJC: string;
}) {
  return queryOptions({
    queryKey: ["enrolled_student", batch, UAN, MJC],
    queryFn: async () => {
      const res = await fetchEnrolledStudent({ batch, UAN, MJC });
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
