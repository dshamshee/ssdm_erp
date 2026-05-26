import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { academicSessionTable } from "@/lib/db/schema/department";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const SessionDetailsCard = ({ courseSessionId, session }: { courseSessionId: string; session: typeof academicSessionTable.$inferSelect }) => {

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>{session.name}</CardTitle>
                    <Link href={`/course-session/${courseSessionId}`} className="flex justify-center items-center cursor-pointer">
                        {/* <Badge variant="link">{course.code}</Badge> */}
                        <ChevronRight className="h-6 w-6 text-cyan-700" />
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row justify-between items-center mb-2">
                        <CardDescription>{session.startDate}</CardDescription>
                        <CardDescription className="">{session.endDate}</CardDescription>
                    </div>
                    {/* <CardDescription className="text-xs">{course.description}</CardDescription> */}
                </CardContent>
                {/* <CardFooter >
                    <h1 className="text-xs text-gray-500">Add Semester for this course session</h1>
                </CardFooter> */}
            </Card>

        </>
    )
} 