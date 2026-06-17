import { queryOptions, useQuery } from "@tanstack/react-query";
import { getTenders } from "../lib/action";

export const getTendersQuery = () =>
  queryOptions({
    queryKey: ["tenders"],
    queryFn: async () => {
      const res = await getTenders();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetTenders = () => {
  return useQuery(getTendersQuery());
};
