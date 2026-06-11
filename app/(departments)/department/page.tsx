import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { fetchDepartments } from "./lib/action";
import { getCoursesByDepartment } from "./query/get-courses-by-department";
import { getDepartment } from "./query/get-all-department";
import { DepartmentContent } from "./_components/department-content";
import { ContentLayout } from "@/components/content-layout";

export default async function DepartmentPage() {
  const queryClient = new QueryClient();

  // Prefetch departments first
  await queryClient.prefetchQuery(getDepartment());

  // Prefetch courses for each department so the sheet opens instantly
  const departmentsResult = await fetchDepartments();
  if (departmentsResult.success && departmentsResult.data) {
    await Promise.all(
      departmentsResult.data.map((dept) =>
        queryClient.prefetchQuery(getCoursesByDepartment(dept.id)),
      ),
    );
  }

  return (
    <ContentLayout title="Departments">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DepartmentContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
