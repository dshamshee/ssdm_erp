"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourseDetails } from "../query/get-course";

export function CourseDetailsTabs({ id }: { id: string }) {
  const { data: course, isLoading, error } = useQuery(
    getCourseDetails({ id }),
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading course...</div>;
  }

  if (error || !course) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error?.message || "Failed to load course"}
      </div>
    );
  }

  const totalSemesters = course.duration * 2;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{course.name}</h1>
            <p className="text-sm text-muted-foreground">
              {course.department?.name || "Department"} • {course.type}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Code: {course.code}</Badge>
            <Badge variant="secondary">{course.duration} Years</Badge>
            <Badge variant="outline">{totalSemesters} Semesters</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList variant="line" className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <div>
                <span className="text-foreground">Department:</span>{" "}
                {course.department?.name || "—"}
              </div>
              <div>
                <span className="text-foreground">Code:</span> {course.code}
              </div>
              <div>
                <span className="text-foreground">Type:</span> {course.type}
              </div>
              <div>
                <span className="text-foreground">Duration:</span>{" "}
                {course.duration} Years ({totalSemesters} semesters)
              </div>
              <div>
                <span className="text-foreground">Description:</span>{" "}
                {course.description}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="pt-4">
          {course.batches.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No batches created yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {course.batches.map((batch) => (
                <Card key={batch.id}>
                  <CardHeader className="gap-1">
                    <CardTitle className="text-base">
                      {batch.session?.name || "Session"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {batch.semesters.length} semesters
                    </p>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <Link
                      href={`/batch/${batch.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      View batch details
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="semesters" className="pt-4">
          {course.batches.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Semesters will appear once a batch is created.
            </div>
          ) : (
            <div className="grid gap-4">
              {course.batches.map((batch) => (
                <div key={batch.id} className="grid gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {batch.session?.name || "Session"}
                  </h3>
                  <div className="grid gap-2">
                    {batch.semesters.map((semester) => {
                      const subjectsCount = semester.semesterSubjects.length;
                      const totalFee = semester.fees.reduce((total, fee) => {
                        return (
                          total +
                          fee.institution +
                          fee.university +
                          fee.late +
                          fee.practical +
                          fee.cultural +
                          fee.sports +
                          fee.miscellaneous
                        );
                      }, 0);
                      return (
                        <details
                          key={semester.id}
                          className="rounded-md border px-3 py-2"
                        >
                          <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                            <span>{semester.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Subjects: {subjectsCount} • Total Fee: ₹
                              {totalFee}
                            </span>
                          </summary>
                          <div className="mt-2 text-sm text-muted-foreground">
                            <Link
                              href={`/semester/${semester.id}`}
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              View semester details
                            </Link>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subjects" className="pt-4">
          {course.batches.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No subjects mapped yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {course.batches.map((batch) => (
                <div key={batch.id} className="grid gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {batch.session?.name || "Session"}
                  </h3>
                  {batch.semesters.map((semester) => (
                    <div key={semester.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{semester.name}</p>
                      {semester.semesterSubjects.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No subjects assigned.
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {semester.semesterSubjects.map((entry) => (
                            <Badge key={entry.id} variant="outline">
                              {entry.subject?.name || "Subject"}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fees" className="pt-4">
          {course.batches.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No fees configured yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {course.batches.flatMap((batch) =>
                batch.semesters.map((semester) => {
                  const totalFee = semester.fees.reduce((total, fee) => {
                    return (
                      total +
                      fee.institution +
                      fee.university +
                      fee.late +
                      fee.practical +
                      fee.cultural +
                      fee.sports +
                      fee.miscellaneous
                    );
                  }, 0);
                  return (
                    <div
                      key={semester.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{semester.name}</span>
                      <span className="text-muted-foreground">
                        Total Fee: ₹{totalFee}
                      </span>
                    </div>
                  );
                }),
              )}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
