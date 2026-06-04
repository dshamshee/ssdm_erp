
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CourseContent } from "./_components/course-content";
import { getCoursesQuery } from "./query/get-courses";

export default async function CoursePage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getCoursesQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage courses, sessions, semesters, and curriculum structure.
          </p>
        </div>
        <CourseContent />
      </main>
    </HydrationBoundary>
  );
}