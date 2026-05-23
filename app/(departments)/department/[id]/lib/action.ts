'use server'
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseTable, departmentTable } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// All courses by Department ID
export async function fetchCoursesByDepartment(departmentId: string) {
    try {

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return { success: false, message: "Unauthorized" }
        }

        if (session.user.role !== "admin") {
            return { success: false, message: "You are not authorized to access this page" }
        }


        // We query the department master table and include its matching active courses
        const departmentWithCourses = await db.query.departmentTable.findFirst({
            where: eq(departmentTable.id, departmentId),
            with: {
                // Note: Ensure your relations are defined in your schema file 
                // so 'courseTable' or 'courses' is recognized as a relation here.
                courses: {
                    where: eq(courseTable.isActive, true)
                }
            }
        });

        if (!departmentWithCourses) {
            return { success: false, message: "Department not found" };
        }

        return {
            success: true,
            data: departmentWithCourses
        };


    } catch (error) {
        return {
            success: false,
            message: "Error fetching courses",
            error: error,
        }
    }
}
