import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getCourseDetails } from "./query/get-course";
import { CourseDetailsTabs } from "./_components/course-details-tabs";

export default async function CourseByIdPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getCourseDetails({ id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-4 p-4">
        <CourseDetailsTabs id={id} />
      </main>
    </HydrationBoundary>
  );
}