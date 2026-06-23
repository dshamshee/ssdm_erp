import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { getCoursesQuery } from "@/app/(departments)/course/query/get-courses";
import { StudentSearchPanel } from "./_components/student-search-panel";

export default async function PassOutStudentsPage() {
  const queryClient = new QueryClient();

  // Prefetch academic data for filters
  await Promise.all([
    queryClient.prefetchQuery(getAcademicSessionsQuery()),
    queryClient.prefetchQuery(getDepartment()),
    queryClient.prefetchQuery(getCoursesQuery()),
  ]);

  return (
    <ContentLayout title="Pass Out Students">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-6">
          <h1 className="text-2xl font-semibold">Student Search & Graduation</h1>
          <p className="text-sm text-muted-foreground">
            Search student records by academic or personal details and promote eligible students to Passed status.
          </p>
        </div>
        <div className="mt-6">
          <StudentSearchPanel />
        </div>
      </HydrationBoundary>
    </ContentLayout>
  );
}
