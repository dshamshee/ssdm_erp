"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenderTable } from "@/lib/db/schema";
import {
  type AddTenderSchema,
  addTenderSchema,
  type UpdateTenderSchema,
  updateTenderSchema,
} from "./zod-type/tender-type";

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

export async function getTenders() {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const data = await db.query.tenderTable.findMany({
      orderBy: [desc(tenderTable.updatedAt), desc(tenderTable.createdAt)],
    });

    return { success: true, data };
  } catch (error) {
    console.error("[getTenders] Error:", error);
    return {
      success: false,
      message: "Something went wrong while fetching tenders.",
    };
  }
}

export async function addTender(input: AddTenderSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = addTenderSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid tender details" };
    }

    const [record] = await db
      .insert(tenderTable)
      .values({
        title: parsedInput.data.title,
        description: parsedInput.data.description || null,
        startDate: parsedInput.data.startDate,
        endDate: parsedInput.data.endDate,
        document: parsedInput.data.document,
      })
      .returning();

    revalidatePath("/");
    return { success: true, data: record };
  } catch (error) {
    console.error("[addTender] Error:", error);
    return {
      success: false,
      message: "Something went wrong while adding tender.",
    };
  }
}

export async function updateTender(input: UpdateTenderSchema) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const parsedInput = updateTenderSchema.safeParse(input);
    if (!parsedInput.success) {
      return { success: false, message: "Invalid tender details" };
    }

    const { id, title, description, startDate, endDate, document } =
      parsedInput.data;

    const [record] = await db
      .update(tenderTable)
      .set({
        title,
        description: description || null,
        startDate,
        endDate,
        document,
        updatedAt: new Date(),
      })
      .where(eq(tenderTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Tender not found" };
    }

    revalidatePath("/");
    return { success: true, data: record };
  } catch (error) {
    console.error("[updateTender] Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating tender.",
    };
  }
}

export async function deleteTender(id: string) {
  try {
    const session = await getAdminSession();
    if (!session.success) {
      return session;
    }

    const [record] = await db
      .delete(tenderTable)
      .where(eq(tenderTable.id, id))
      .returning();

    if (!record) {
      return { success: false, message: "Tender not found" };
    }

    revalidatePath("/");
    return { success: true, data: record };
  } catch (error) {
    console.error("[deleteTender] Error:", error);
    return {
      success: false,
      message: "Something went wrong while deleting tender.",
    };
  }
}
