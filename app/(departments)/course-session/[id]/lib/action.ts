'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { semesterTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";


export async function fetchSemestersByCourseSession(courseSessionId: string) {
    try {

        const session = await auth.api.getSession({headers: await headers()});
        if(!session){
            return {success: false, message: "Unauthorized"}
        }
        if(session.user.role !== "admin"){
            return {success: false, message: "You are not authorized to access"}
        }

        const semesters = await db.query.semesterTable.findMany({
            where: eq(semesterTable.courseSessionId, courseSessionId)
        });
        if (!semesters) return { success: false, message: "No semesters found" }
        return {
            success: true,
            data: semesters,
        }

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error fetching semesters",
        }
    }
}