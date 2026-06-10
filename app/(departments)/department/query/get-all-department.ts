import { queryOptions } from "@tanstack/react-query";

import { fetchDepartments } from "@/app/(departments)/department/lib/action";

export function getDepartment() {
  return queryOptions({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await fetchDepartments();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
