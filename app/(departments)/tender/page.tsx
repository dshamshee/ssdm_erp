import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ContentLayout } from "@/components/content-layout";
import { TenderContent } from "./_components/tender-content";
import { getTendersQuery } from "./query/get-tenders";

export default async function TenderPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getTendersQuery());

  return (
    <ContentLayout title="Tenders">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-2xl font-semibold">Tenders</h1>
          <p className="text-sm text-muted-foreground">
            Manage tender notices, upload documents, and track active and
            expired tenders.
          </p>
        </div>
        <TenderContent />
      </HydrationBoundary>
    </ContentLayout>
  );
}
