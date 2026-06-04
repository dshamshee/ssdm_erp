"use server";

import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  batchTable,
  courseTable,
  semesterTable,
} from "@/lib/db/schema";

async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      success: false as const,
      message: "Unauthorized",
    };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return {
      success: false as const,
      message: "Forbidden",
    };
  }

  return {
    success: true as const,
    data: session,
  };
}

export async function fetchCourseById(courseId: string) {

    try {

        const session = await getAdminSession();
        if (!session.success) {
            return session;
        }

        const courseWithBatches = await db.query.courseTable.findFirst({
            where: and(eq(courseTable.id, courseId), eq(courseTable.isActive, true)),
            with: {
                department: true,
                batches: {
                    where: eq(batchTable.courseId, courseId),
                    with: {
                        session: true,
                        semesters: {
                            orderBy: [
                                asc(semesterTable.semesterNumber),
                            ],
                            with: {
                                fees: true,
                                semesterSubjects: {
                                    with: {
                                        subject: true,
                                    },
                                },
                            },
                        },
                    }
                }
            }
        });
        if (!courseWithBatches) return { success: false, message: "Course not found" }
        return {
            success: true,
            data: courseWithBatches,
        }

    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error fetching course",
        }
    }
}