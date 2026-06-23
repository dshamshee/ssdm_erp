import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { getAcademicSessionsQuery } from "@/app/(departments)/academic-session/query/get-academic-session";
import { StudentPromotionPanel } from "./_components/student-promotion-panel";

export default async function PromoteStudentsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getAcademicSessionsQuery());

  return (
    <ContentLayout title="Promote Students">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Semester Promotion</h1>
          <p className="text-sm text-muted-foreground">
            Filter students by session and promote eligible students to the next
            semester.
          </p>
        </div>
        <div className="mt-6">
          <StudentPromotionPanel />
        </div>
      </HydrationBoundary>
    </ContentLayout>
  );
}
