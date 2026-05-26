import { queryOptions } from "@tanstack/react-query";
import { fetchSemestersByCourseSession } from "../lib/action";

export function getCourseSessionSemester({id}: {id: string}){

    return queryOptions({
        queryKey: [
            'semester',
            id
        ],
        queryFn: async () => {
            const res = await fetchSemestersByCourseSession(id)
            if(!res.success){
                throw new Error(res.message)
            }
            return res.data
        },
        retry: false,
    })
}