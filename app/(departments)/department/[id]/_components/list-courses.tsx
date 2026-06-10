"use client";
import { useQuery } from "@tanstack/react-query";
import { getCourses } from "../query/get-department";
import { CourseCard } from "./course-card";
import { AddCourse } from "./add-course";

export function ListCourses({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery(getCourses({ id }));

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // console.log(typeof data)

  // console.log(data)

  return (
    <>
      <div className="departmentDetails bg-blue-400 w-full py-2 flex justify-center flex-col gap-2 items-center">
        <h1 className="text-2xl font-bold">{data?.name}</h1>
        {/* <Button>New Course</Button> */}
        <AddCourse />
      </div>

      <div className="courses">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.courses.map((course) => {
            return (
              // <li key={course.id}>{course.name}</li>
              <CourseCard key={course.id} course={course} />
            );
          })}
        </ul>
      </div>
    </>
  );
}
