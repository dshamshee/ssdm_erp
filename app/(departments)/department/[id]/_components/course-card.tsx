import { courseTable } from "@/lib/db/schema/department";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
export const CourseCard = ({
  course,
}: {
  course: typeof courseTable.$inferSelect;
}) => {
  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>{course.name}</CardTitle>
          <Link
            href={`/course/${course.id}`}
            className="flex justify-center items-center cursor-pointer"
          >
            <Badge variant="link">{course.code}</Badge>
            <ChevronRight className="h-4 w-4 text-cyan-700" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row justify-between items-center mb-2">
            <CardDescription>{course.type}</CardDescription>
            <CardDescription className="text-xs">
              Duration: {course.duration} Years
            </CardDescription>
          </div>
          <CardDescription className="text-xs">
            {course.description}
          </CardDescription>
        </CardContent>
        <CardFooter>
          <Badge
            variant="outline"
            className={`${course.isActive ? "border-green-500 text-green-500" : "border-red-500 text-red-500"} font-bold`}
          >
            {course.isActive ? "Active" : "Inactive"}
          </Badge>
        </CardFooter>
      </Card>
    </>
  );
};
