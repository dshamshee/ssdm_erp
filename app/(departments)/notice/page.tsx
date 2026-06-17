import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { NoticeContent } from "./_components/notice-content";
import { getNoticesQuery } from "./query/get-notices";

export default async function NoticePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getNoticesQuery());

  return (
    <ContentLayout title="Notices">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-semibold">Notices</h1>
          <p className="text-sm text-muted-foreground">
            Manage college notices, upload notice PDFs, and track active and
            expired notices.
          </p>
        </div>
        <NoticeContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
