'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { semesterSubjectTable, semesterTable, subjectTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export async function fetchSemesterById(semesterId: string){
    try {

        const session = await auth.api.getSession({headers: await headers()})
        if(!session){
            return {success: false, message: "Unauthorized"}
        }
        if(session.user.role !== "admin"){
            return {success: false, message: "You are not authorized to access"}
        }

        const semester = await db.query.semesterTable.findFirst({
            where: eq(semesterTable.id, semesterId),
            with:{
                semesterSubjects: {
                    with:{
                        subject: true
                    }
                }
            }
        });
        if (!semester) return { success: false, message: "Semester not found" }
        return {
            success: true,
            data: semester,
        }

    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch semester",
            error: error,
        }
    }
}

// export async function fetchSubjectsBySemester(semesterId: number) {
//     try {

//         const session = await auth.api.getSession({headers: await headers()})
//         if(!session){
//             return {success: false, message: "Unaothorized"}
//         }
//         if(session.user.role !== "admin"){
//             return {success: false, message: "You are not authorized to access"}
//         }

//         const semesterSubjects = await db.query.semesterSubjectTable.findMany({
//             where: eq(semesterSubjectTable.semesterId, semesterId)
//         })
//         // find subjects by subjectId in this semestertable using the subjectId
//         const subjects = await db.query.subjectTable.findMany({
//             where: inArray(subjectTable.id, semesterSubjects.map(ss => ss.subjectId))
//         })

//         if (!subjects) return { success: false, message: "No subjects found" }

//         return {
//             success: true,
//             message: "Subjects fetched successfully",
//             data: subjects,
//         }
//     } catch (error) {
//         return {
//             success: false,
//             message: "Failded to fetch Subjects",
//             error: error,
//         }
//     }
// }