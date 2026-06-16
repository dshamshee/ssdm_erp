import { createId } from "@paralleldrive/cuid2";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import {
  batchTable,
  EnrolledStudentTable,
  subjectTable,
} from "@/lib/db/schema";

// Zod Schema for validation
const enrolledStudentItemSchema = z.object({
  UAN: z.string().min(1, "UAN is required"),
  registrationNumber: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  ABCID: z.string().optional().nullable(),
  universityRoll: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  fathersName: z.string().optional().nullable(),
  mothersName: z.string().optional().nullable(),
  caste: z
    .enum(["GEN", "BC", "EBC", "SC", "ST", "OTHER"])
    .optional()
    .nullable(),
  reservation: z.string().optional().nullable(),
  phone: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Transgender"]),
  DOB: z
    .string()
    .transform((val) => (val.includes("T") ? val.split("T")[0] : val))
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "DOB must be in YYYY-MM-DD format",
    }),
  admissionType: z
    .enum(["MERIT", "SPORT", "MANAGEMENT QUOTA", "OTHER"])
    .optional()
    .nullable(),
  subMJC: z.string().min(1, "Major Subject (subMJC) is required"),
  subMIC: z.array(z.string()).optional().default([]),
  subMDC: z.array(z.string()).optional().default([]),
  subAEC: z.array(z.string()).optional().default([]),
  subSEC: z.array(z.string()).optional().default([]),
  subVAC: z.array(z.string()).optional().default([]),
  batchId: z.string().min(1, "Batch ID (batchId) is required"),
  isSubmitted: z.boolean().optional().default(false),
  isFeePaid: z.boolean().optional().default(false),
});

const bulkEnrolledStudentSchema = z.array(enrolledStudentItemSchema);

interface DbError {
  code?: string;
  detail?: string;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onConflict = searchParams.get("onConflict") || "fail"; // 'fail' | 'ignore'

    if (onConflict !== "fail" && onConflict !== "ignore") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid onConflict parameter. Supported values: 'fail', 'ignore'",
        },
        { status: 400 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (!Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request body must be a JSON array of enrolled student objects",
        },
        { status: 400 },
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The enrolled students list cannot be empty",
        },
        { status: 400 },
      );
    }

    // 1. Zod Schema Validation
    const parsed = bulkEnrolledStudentSchema.safeParse(body);
    if (!parsed.success) {
      // Group and format Zod errors by record index
      const formattedErrors = parsed.error.issues.map((err) => {
        const index = err.path[0];
        const field = err.path.slice(1).join(".");
        return { index, field, message: err.message };
      });

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed for one or more records.",
          errors: formattedErrors,
        },
        { status: 400 },
      );
    }

    const students = parsed.data;

    // 2. Referenced Data Existence Validation (batchId and subMJC)
    const uniqueBatchIds = Array.from(new Set(students.map((s) => s.batchId)));
    const uniqueMjcIds = Array.from(new Set(students.map((s) => s.subMJC)));

    // Fetch existing batches
    const existingBatches = await db
      .select({ id: batchTable.id })
      .from(batchTable)
      .where(inArray(batchTable.id, uniqueBatchIds));
    const existingBatchIdsSet = new Set(existingBatches.map((b) => b.id));
    const missingBatchIds = uniqueBatchIds.filter(
      (id) => !existingBatchIdsSet.has(id),
    );

    // Fetch existing MJC subjects
    const existingSubjects = await db
      .select({ id: subjectTable.id })
      .from(subjectTable)
      .where(inArray(subjectTable.id, uniqueMjcIds));
    const existingSubjectIdsSet = new Set(existingSubjects.map((s) => s.id));
    const missingMjcIds = uniqueMjcIds.filter(
      (id) => !existingSubjectIdsSet.has(id),
    );

    if (missingBatchIds.length > 0 || missingMjcIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Referenced database entities do not exist.",
          errors: {
            missingBatchIds:
              missingBatchIds.length > 0 ? missingBatchIds : undefined,
            missingMjcIds: missingMjcIds.length > 0 ? missingMjcIds : undefined,
          },
        },
        { status: 400 },
      );
    }

    // Prepare records for insertion (assign IDs)
    const recordsToInsert = students.map((student) => ({
      id: createId(),
      ...student,
    }));

    // 3. Database Insertion
    try {
      if (onConflict === "ignore") {
        const result = await db
          .insert(EnrolledStudentTable)
          .values(recordsToInsert)
          .onConflictDoNothing()
          .returning({ id: EnrolledStudentTable.id });

        const insertedCount = result.length;
        const ignoredCount = recordsToInsert.length - insertedCount;

        return NextResponse.json({
          success: true,
          message: `Process completed: ${insertedCount} students inserted, ${ignoredCount} conflicts ignored.`,
          insertedCount,
          ignoredCount,
        });
      }

      // 'fail' mode: Run in transaction to guarantee atomicity
      const result = await db.transaction(async (tx) => {
        return await tx
          .insert(EnrolledStudentTable)
          .values(recordsToInsert)
          .returning({ id: EnrolledStudentTable.id });
      });

      return NextResponse.json({
        success: true,
        message: `Successfully inserted all ${result.length} enrolled students.`,
        count: result.length,
      });
    } catch (dbErr) {
      const dbError = dbErr as DbError;
      console.error("[Bulk Insert DB Error]:", dbError);

      // Handle unique constraint violations gracefully (PostgreSQL error 23505)
      if (dbError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A duplicate record already exists in the database.",
            detail:
              dbError.detail ||
              "One or more unique constraints (UAN, email, phone, or registration number) were violated.",
          },
          { status: 409 },
        );
      }

      // Handle check constraint violations (PostgreSQL error 23514)
      if (dbError.code === "23514") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A check constraint was violated.",
            detail:
              dbError.message ||
              "One of the fields (gender, caste, or admissionType) contains a value not allowed by constraints.",
          },
          { status: 400 },
        );
      }

      // Handle foreign key constraint violations (PostgreSQL error 23503)
      if (dbError.code === "23503") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: A foreign key constraint was violated.",
            detail:
              dbError.detail ||
              "One of the referenced values (batchId or subMJC) does not exist in the database.",
          },
          { status: 400 },
        );
      }

      // Handle undefined column violations (PostgreSQL error 42703)
      if (dbError.code === "42703") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Database insertion failed: One of the columns does not exist in the database. Please run 'bun run db:push' to sync the schema.",
            detail: dbError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error during database insertion",
          error: dbError.message || String(dbError),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    const err = error as Error;
    console.error("[Bulk Insert API Route Error]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
