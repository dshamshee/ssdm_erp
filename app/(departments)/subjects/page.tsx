import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { SubjectsContent } from "./_components/subjects-content";
import { getSubjectsQuery } from "./query/get-subjects";

export default async function SubjectsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getSubjectsQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            Manage subjects across your curriculum.
          </p>
        </div>
        <SubjectsContent />
      </main>
    </HydrationBoundary>
  );
}
