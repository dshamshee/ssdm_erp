import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { courseTable, departmentTable } from "@/lib/db/schema";

type CourseWithDepartment = typeof courseTable.$inferSelect & {
  department?: typeof departmentTable.$inferSelect | null;
};

export function CourseCard({ course }: { course: CourseWithDepartment }) {
  const semestersCount = course.duration * 2;

  return (
    <Link href={`/course/${course.id}`} className="block">
      <Card size="sm" className="h-full transition-colors hover:bg-muted/60">
        <CardHeader className="gap-2 pb-2">
          <div className="flex items-center justify-between">
            {/* <Badge variant="outline">[{course.code}]</Badge> */}
            <p></p>
            <Badge variant={course.isActive ? "secondary" : "outline"}>
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardTitle className="text-lg">
            <b>{course.name}</b>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span>
              <span className="text-foreground">Code:</span> {course.code}
            </span>
            <span>
              <span className="text-foreground">Department:</span>{" "}
              {course.department?.name || "—"}
            </span>
            <span>
              <span className="text-foreground">Duration:</span>{" "}
              {course.duration} Years
            </span>
            <span>
              <span className="text-foreground">Semesters:</span>{" "}
              {semestersCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
