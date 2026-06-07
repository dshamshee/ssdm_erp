'use server'

import { db } from "@/lib/db"
import { AdmittedStudentTable, EnrolledStudentTable } from "@/lib/db/schema/student"
import { subjectTable } from "@/lib/db/schema/department"
import { and, eq, inArray } from "drizzle-orm"

export const fetchEnrolledStudent = async ({ batch, UAN, MJC}: { batch: string, UAN: string, MJC: string }) => {
  try {

    const existingStudent = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, UAN)
    })

    if (existingStudent) {
      return {
        success: false,
        message: "Student already take their admission"
      }
    }

    const student = await db.query.EnrolledStudentTable.findFirst({
      where: and(eq(EnrolledStudentTable.UAN, UAN), eq(EnrolledStudentTable.batchId, batch), eq(EnrolledStudentTable.subMJC, MJC)),
      with: {
        subMJC: true,
        batch: {
          with: {
            course: {
              with: {
                department: true,
              },
            },
            academicSession: true,
          },
        },
      },
    })

    if (!student) {
      return {
        success: false,
        message: "Student not found"
      }
    }

    // Populate subMIC, subMDC, subSEC, subVAC from subjectTable
    const subMICIds = (student.subMIC || []) as string[]
    const subMDCIds = (student.subMDC || []) as string[]
    const subSECIds = (student.subSEC || []) as string[]
    const subVACIds = (student.subVAC || []) as string[]

    const allSubjectIds = Array.from(new Set([...subMICIds, ...subMDCIds, ...subSECIds, ...subVACIds])).filter(Boolean)

    let subjects: any[] = []
    if (allSubjectIds.length > 0) {
      subjects = await db.select().from(subjectTable).where(inArray(subjectTable.id, allSubjectIds))
    }

    const subjectMap = new Map(subjects.map((s) => [s.id, s]))

    const populatedStudent = {
      ...student,
      subMIC: subMICIds.map((id) => subjectMap.get(id) || { id, name: id }).filter(Boolean),
      subMDC: subMDCIds.map((id) => subjectMap.get(id) || { id, name: id }).filter(Boolean),
      subSEC: subSECIds.map((id) => subjectMap.get(id) || { id, name: id }).filter(Boolean),
      subVAC: subVACIds.map((id) => subjectMap.get(id) || { id, name: id }).filter(Boolean),
    }

    return {
      success: true,
      data: populatedStudent
    }

  } catch (error) {
    console.error("[fetchEnrolledStudent] Error:", error);
    return {
      success: false,
      message: "Internal Server Error during fetching enrolled student",
      error: error
    }
  }
}
