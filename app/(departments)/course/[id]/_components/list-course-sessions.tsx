"use client"

import { useQuery } from "@tanstack/react-query"
import { getCourseWithSession } from "../query/get-course"
import { SessionDetailsCard } from "./session-details-card"
import { AddSession } from "./add-session"

export const ListCourseSessions = ({ id }: { id: string }) => {
    const { data, isLoading, error } = useQuery(getCourseWithSession({ id }))

    console.log(data)


    if (isLoading) {
        return <div>Loading...</div>
    }
    if (error) {
        return <div>Error: {error.message}</div>
    }


    return (
        <>
            <div className="head w-full bg-cyan-400 flex flex-col items-center justify-center gap-2 py-2">
                <h1 className="text-2xl font-bold">{data?.name}</h1>
                {/* <h1>New Session</h1> */}
                <AddSession />
            </div>
            <div className="list">
                <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10 px-2">
                    {
                        data?.courseSessions.map((courseSession) => {
                            return (
                                // <li key={courseSession.id}>{courseSession.session?.name}</li>
                                <SessionDetailsCard courseSessionId={courseSession.id} session={courseSession.session} key={courseSession.id} />
                            )
                        })
                    }
                </ul>
            </div>
        </>
    )
}