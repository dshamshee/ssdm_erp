"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notice } from "@/lib/db/schema";
import {
  type AddNoticeSchema,
  addNoticeSchema,
  type UpdateNoticeSchema,
  updateNoticeSchema,
} from "./zod-type/notice-type";

async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (session.user.role !== "admin" && session.user.role !== "superAdmin") {
    return { success: false as const, message: "Forbidden" };
  }

  return { success: true as const, data: session };
}

export async function getNotices() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const data = await db.query.notice.findMany({
      orderBy: [desc(notice.updatedAt), desc(notice.createdAt)],
    });

    return { success: true, data };
  } catch (error) {
    console.error("[getNotices] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching notices.",
    };
  }
}

export async function addNotice(input: AddNoticeSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addNoticeSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid notice details" };
    }

    const [record] = await db
      .insert(notice)
      .values({
        title: parsedInput.data.title,
        description: parsedInput.data.description || null,
        startDate: parsedInput.data.startDate,
        endDate: parsedInput.data.endDate,
        file: parsedInput.data.file,
      })
      .returning();

    return { success: true, data: record };
  } catch (error) {
    console.error("[addNotice] Error:", error);
    return {
      success: false,
      message: "Something went wrong while adding notice.",
    };
  }
}

export async function updateNotice(input: UpdateNoticeSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateNoticeSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid notice details" };
    }

    const { id, title, description, startDate, endDate, file } =
      parsedInput.data;

    const [record] = await db
      .update(notice)
      .set({
        title,
        description: description || null,
        startDate,
        endDate,
        file,
        updatedAt: new Date(),
      })
      .where(eq(notice.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Notice not found" };
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("[updateNotice] Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating notice.",
    };
  }
}

export async function deleteNotice(id: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const [record] = await db
      .delete(notice)
      .where(eq(notice.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Notice not found" };
    }

    return { success: true, data: record };
  } catch (error) {
    console.error("[deleteNotice] Error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting notice.",
    };
  }
}
