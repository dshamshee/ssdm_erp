"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon, ClockIcon, LayersIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoursesByDepartment } from "../query/get-courses-by-department";

interface DepartmentCoursesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  departmentName: string;
}

export function DepartmentCoursesSheet({
  open,
  onOpenChange,
  departmentId,
  departmentName,
}: DepartmentCoursesSheetProps) {
  const { data: courses, isLoading, isError } = useQuery(
    getCoursesByDepartment(departmentId),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-screen overflow-y-auto px-6">
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="size-4 text-muted-foreground" />
            <SheetTitle className="text-base">
              Department of {departmentName}
            </SheetTitle>
          </div>
          <SheetDescription>Courses offered by this department</SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Failed to load courses. Please try again.
          </p>
        )}

        {!isLoading && !isError && courses?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No courses found for this department.
          </p>
        )}

        {!isLoading && !isError && courses && courses.length > 0 && (
          <ul className="grid gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/batch/${course.id}`}
                  className="block h-full"
                >
                  <Card
                    size="sm"
                    className="h-full transition-colors hover:bg-muted/60"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="uppercase">{course.name}</CardTitle>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {course.code}
                        </Badge>
                      </div>
                      {course.description && (
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ClockIcon className="size-3" />
                          {course.duration} yr{course.duration > 1 ? "s" : ""} ·{" "}
                          {course.duration * 2} semesters
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <LayersIcon className="size-3" />
                          {course.type}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
