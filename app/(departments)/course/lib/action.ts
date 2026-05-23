'use server'

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function fetchAllCourses() {
    try {

        const session = await auth.api.getSession({headers: await headers()});
        if(!session){
            return {success: false, message: "Unauthorized"}
        }
        if(session.user.role !== "admin"){
            return{success: false, message: "You are not authorized to access this page"}
        }

        const courses = await db.query.courseTable.findMany();
        if (!courses) return { success: false, message: "No courses found" }
        return {
            success: true,
            data: courses,
        }
    } catch (error) {
        return {
            success: false,
            message: "Error fetching courses",
            error: error,
        }
    }
}