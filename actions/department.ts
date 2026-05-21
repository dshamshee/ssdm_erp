'use server'
import { db } from "@/lib/db";
import { courseTable, departmentTable, semesterSubjectTable, semesterTable, subjectTable } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { ReturnType } from "@/types/return";

export async function fetchDepartments(): Promise<ReturnType> {

    try {

        const departments = await db.query.departmentTable.findMany();

        if (!departments) {
            return { success: false, message: "No departments found", data: null, statusCode: 404 }
        }

        return {
            success: true,
            message: "Departments fetched successfully",
            data: departments,
            statusCode: 200
        }


    } catch (error) {
        return {
            success: false,
            message: "Error fetching departments",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchAllCourses(): Promise<ReturnType> {
    try {
        const courses = await db.query.courseTable.findMany();
        if (!courses) return { success: false, message: "No courses found", data: [], statusCode: 404 }
        return {
            success: true,
            message: "Courses fetched successfully",
            data: courses,
            statusCode: 200
        }
    } catch (error) {
        return {
            success: false,
            message: "Error fetching courses",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchCoursesByDepartment(departmentId: number): Promise<ReturnType> {
    try {
        const courses = await db.query.courseTable.findMany({
            where: and(eq(courseTable.departmentId, departmentId), eq(courseTable.isActive, true))
        });
        if (!courses) return { success: false, message: "No courses found", data: [], statusCode: 404 }
        return {
            success: true,
            message: "Courses fetched successfully",
            data: courses,
            statusCode: 200
        }
    } catch (error) {
        return {
            success: false,
            message: "Error fetching courses",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchCourseById(courseId: number): Promise<ReturnType> {

    try {
        const course = await db.query.courseTable.findFirst({
            where: and(eq(courseTable.id, courseId), eq(courseTable.isActive, true))
        });
        if (!course) return { success: false, message: "Course not found", data: null, statusCode: 404 }
        return {
            success: true,
            message: "Course fetched successfully",
            data: course,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: "Error fetching course",
            error: error,
            statusCode: 500
        }

    }
}

export async function fetchSemestersByCourseSession(courseSessionId: number): Promise<ReturnType> {
    try {
        const semesters = await db.query.semesterTable.findMany({
            where: eq(semesterTable.courseSessionId, courseSessionId)
        });
        if (!semesters) return { success: false, message: "No semesters found", data: null, statusCode: 404 }
        return {
            success: true,
            message: "Semesters fetched successfully",
            data: semesters,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: "Error fetching semesters",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchSemesterById(semesterId: number): Promise<ReturnType> {
    try {
        const semester = await db.query.semesterTable.findFirst({
            where: eq(semesterTable.id, semesterId)
        });
        if (!semester) return { success: false, message: "Semester not found", data: null, statusCode: 404 }
        return {
            success: true,
            message: "Semester fetched successfully",
            data: semester,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: "Error fetching semester",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchSubjectsBySemester(semesterId: number): Promise<ReturnType> {
    try {
        const semesterSubjects = await db.query.semesterSubjectTable.findMany({
            where: eq(semesterSubjectTable.semesterId, semesterId)
        })
        // find subjects by subjectId in this semestertable using the subjectId
        const subjects = await db.query.subjectTable.findMany({
            where: inArray(subjectTable.id, semesterSubjects.map(ss => ss.subjectId))
        })

        if (!subjects) return { success: false, message: "No subjects found", data: [], statusCode: 404 }

        return {
            success: true,
            message: "Subjects fetched successfully",
            data: subjects,
            statusCode: 200
        }
    } catch (error) {
        return {
            success: false,
            message: "Error fetching subjects",
            error: error,
            statusCode: 500
        }
    }
}

export async function fetchSubjectById(subjectId: number): Promise<ReturnType> {
    try {
        const subject = await db.query.subjectTable.findFirst({
            where: and(eq(subjectTable.id, subjectId), eq(subjectTable.isActive, true))
        });
        if (!subject) return { success: false, message: "Subject not found", data: null, statusCode: 404 }
        return {
            success: true,
            message: "Subject fetched successfully",
            data: subject,
            statusCode: 200
        }

    } catch (error) {
        return {
            success: false,
            message: "Error fetching subject",
            error: error,
            statusCode: 500
        }
    }
}
