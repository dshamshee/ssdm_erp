"use client";

import { CourseCard } from "./course-card";
import { AddCourseDialog } from "./add-course-dialog";
import { useGetCourses } from "../query/get-courses";

export function CourseContent() {
  const { data: courses = [], isPending, isError, error } = useGetCourses();

  if (isPending) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error?.message || "Failed to load courses"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddCourseDialog />
      </div>
      {courses.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No courses found.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ul>
      )}
    </div>
  );
}
