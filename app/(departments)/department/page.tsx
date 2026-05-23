import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ListDepartment } from "./_components/list-department";
import { getDepartment } from "./query/get-all-department";

export default async function DepartmentPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getDepartment());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListDepartment />
    </HydrationBoundary>
  );
}
