'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function fetchCourseById(courseId: number) {

    try {

        const session = await auth.api.getSession({headers: await headers()});
        if(!session){
            return {success: false, message: "Unauthorized"}
        }
        if(session.user.role !== "admin"){
            return {success: false, message: "You are not authorized to access this page"}
        }

        const course = await db.query.courseTable.findFirst({
            where: and(eq(courseTable.id, courseId), eq(courseTable.isActive, true))
        });
        if (!course) return { success: false, message: "Course not found" }
        return {
            success: true,
            data: course,
        }

    } catch (error) {
        return {
            success: false,
            message: "Error fetching course",
            error: error,
        }

    }
}