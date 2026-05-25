import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getCourses } from "./query/get-department";
import { ListCourses } from "./_components/list-courses";



export default async function DepartmentByIdPage({params}: {params: Promise<{id: string}>}){
    const {id} = await params
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(getCourses({id}))

    return(
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListCourses id={id}/>
        </HydrationBoundary>
    )
}