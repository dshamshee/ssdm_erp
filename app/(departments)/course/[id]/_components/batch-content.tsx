"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetBatchesByCourse } from "../query/get-batches";
import { useGetCourseById } from "../query/get-course-by-id";
import { AddBatchDialog } from "./add-batch-dialog";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface BatchContentProps {
  courseId: string;
}

export function BatchContent({ courseId }: BatchContentProps) {
  const {
    data: course,
    isPending: coursePending,
    isError: courseError,
  } = useGetCourseById(courseId);

  const {
    data: batches = [],
    isPending: batchesPending,
    isError: batchesError,
    error: batchesErr,
  } = useGetBatchesByCourse(courseId);

  if (coursePending || batchesPending) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="text-center py-8 text-destructive">Course not found.</div>
    );
  }

  if (batchesError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {batchesErr?.message || "Failed to load batches"}
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4">
      {/* Back link + Header */}
      <div className="flex flex-col gap-3">
        <Link href="/course">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">{course.name}</h1>
              <Badge variant="outline">{course.code}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {course.department.name} &middot; {course.type} &middot;{" "}
              {course.duration} {course.duration === 1 ? "Year" : "Years"}
            </p>
          </div>
        </div>
      </div>

      {/* Batch table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Batches ({batches.length})</h2>
          <AddBatchDialog courseId={courseId} />
        </div>
        <DataTable columns={columns} data={batches} />
      </div>
    </main>
  );
}
