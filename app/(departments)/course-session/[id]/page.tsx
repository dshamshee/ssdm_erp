import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { getCourseSessionSemester } from "./query/get-course-session"
import { ListSemester } from "./_components/list-semester"


export default async function CourseSessionIdPage({params}: {params: Promise<{id: string}>}){

    const {id} = await params
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery(getCourseSessionSemester({id}))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListSemester id={id}/>
        </HydrationBoundary>
    )
}