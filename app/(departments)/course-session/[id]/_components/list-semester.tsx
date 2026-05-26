'use client'
import { useQuery } from "@tanstack/react-query"
import { getCourseSessionSemester } from "../query/get-course-session"
import { SemesterDetailsCard } from "./semester-details-card"
import { Button } from "@/components/ui/button"
import { AddSemester } from "./add-semester"

export const ListSemester = ({id}: {id: string})=>{

    const {data, isLoading, error} = useQuery(getCourseSessionSemester({id}))

    if(isLoading){
        return <div>Loading...</div>
    }
    if(error){ 
        return <div>Error: {error.message}</div>
    }

    return(
        <>
        <div className="head">
            <div className="flex flex-col justify-center items-center gap-2">
                    <h1 className="text-2xl font-bold">Semesters</h1>
               
                <AddSemester />
            </div>
        </div> 
        <div className="list">
                    <p className="text-muted-foreground">List of all semesters</p>
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5">
                {
                    data?.map((semester)=>{
                        return(
                            <SemesterDetailsCard key={semester.id} semester={semester} />
                        )
                    })
                }
            </ul>
        </div>
        </>
    )
}