'use server'
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";


// Fetch All Departments 
export async function fetchDepartments() {

    try {

        const session = await auth.api.getSession({headers: await headers()});

        if(!session){
            return {success: false, message: "Unauthorized"}
        }

        if(session.user.role !== "admin"){
            return {success: false, message: "You are not authorized to access this page"}
        }

        const departments = await db.query.departmentTable.findMany();

        if (!departments) {
            return { success: false, message: "No departments found" }
        }

        return {
            success: true,
            data: departments,
        }


    } catch (error) {
        return {
            success: false,
            message: "Error fetching departments",
            error: error,
        }
    }
}



