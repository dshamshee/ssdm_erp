import { queryOptions, useQuery } from "@tanstack/react-query";
import { getNotices } from "../lib/action";

export const getNoticesQuery = () =>
  queryOptions({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await getNotices();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });

export const useGetNotices = () => {
  return useQuery(getNoticesQuery());
};
