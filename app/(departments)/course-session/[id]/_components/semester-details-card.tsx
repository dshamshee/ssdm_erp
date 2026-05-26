import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { semesterTable } from "@/lib/db/schema"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export const SemesterDetailsCard = ({semester}: {semester: typeof semesterTable.$inferSelect})=>{

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200 ease-in-out">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>{semester.name}</CardTitle>
                {/* <CardDescription> */}
                <Link href={`/semester/${semester.id}?count=${semester.semesterNumber}`}>
                    <ChevronRight className="text-cyan-600 cursor-pointer"/>
                </Link>
                {/* </CardDescription> */}
            </CardHeader>
            {/* <CardContent>
                <CardDescription>{semester.semesterNumber}</CardDescription>
            </CardContent> */}
            <CardFooter>
                <CardDescription>Course Session: {semester.courseSessionId}</CardDescription>
            </CardFooter>
        </Card>
    )
}