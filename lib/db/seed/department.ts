import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
  courseTable,
  batchTable,
  admissionOpenTable,
} from "@/lib/db/schema";

const NUM_RECORDS = 5;

async function main() {
  console.log(`🌱 Seeding master tables for students...`);
  try {
    // Clear existing data to prevent unique constraint errors
    await db.delete(admissionOpenTable);
    await db.delete(batchTable);
    await db.delete(courseTable);
    await db.delete(subjectTable);
    await db.delete(departmentTable);
    await db.delete(academicSessionTable);

    // 1. Seed Academic Sessions
    const sessions = Array.from({ length: NUM_RECORDS }).map((_, i) => {
      const startYear = 2020 + i;
      const endYear = startYear + 4;
      return {
        name: `${startYear}-${endYear}`,
        startDate: `${startYear}-07-01`,
        endDate: `${endYear}-06-30`,
      };
    });

    const insertedSessions = await db
      .insert(academicSessionTable)
      .values(sessions)
      .returning();
    console.log(`✅ Seeded ${NUM_RECORDS} academic sessions.`);

    // 2. Seed Departments (Required by student.ts: PHYS, CHEM, MATH, COMP, COMM)
    const deptCodes = ["PHYS", "CHEM", "MATH", "COMP", "COMM"];
    const deptNames = [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Applications",
      "Commerce",
    ];
    const departments = deptCodes.map((code, i) => ({
      code,
      name: deptNames[i],
      description: `Department of ${deptNames[i]}`,
    }));

    const insertedDepts = await db
      .insert(departmentTable)
      .values(departments)
      .returning();
    console.log(`✅ Seeded ${departments.length} departments.`);

    // 3. Seed Courses and Batches for each department
    const insertedBatches: Array<{ id: string; deptCode: string }> = [];
    for (const dept of insertedDepts) {
      const course = {
        name: `B.Sc in ${dept.name}`,
        code: `BSC-${dept.code}`,
        type: "UG Regular",
        departmentId: dept.id,
        duration: 4,
      };

      const [insertedCourse] = await db
        .insert(courseTable)
        .values(course)
        .returning();

      const batch = {
        courseId: insertedCourse.id,
        academicSessionId: insertedSessions[insertedSessions.length - 1].id, // Most recent session
        perSemesterFee: 5000,
        isActive: true,
      };

      const [insertedBatch] = await db
        .insert(batchTable)
        .values(batch)
        .returning();
      insertedBatches.push({ ...insertedBatch, deptCode: dept.code });
    }
    console.log(`✅ Seeded courses and batches.`);

    // 4. Seed Admission Open (only for a few batches, not all)
    const batchesForAdmission = insertedBatches.filter((b) =>
      ["PHYS", "COMP"].includes(b.deptCode),
    );

    const admissionOpenRecords = batchesForAdmission.map((batch) => ({
      batchId: batch.id,
      startDate: "2024-06-01",
      endDate: "2024-07-31",
      lateFee: 500,
      isDateExtended: false,
    }));

    await db.insert(admissionOpenTable).values(admissionOpenRecords);
    console.log(
      `✅ Seeded ${admissionOpenRecords.length} admission open records (PHYS, COMP only).`,
    );

    // 5. Seed Subjects (Required by student.ts: codes like PHY-MJC1, MIC, MDC, etc.)
    const subjectPrefixes = ["PHY", "CHM", "MAT", "BCA", "COM"];
    const types = ["MJC", "MIC", "MDC", "AEC", "SEC", "VAC"];
    const subjectsToInsert = [];

    let subjectCounter = 1;
    for (const prefix of subjectPrefixes) {
      for (const type of types) {
        subjectsToInsert.push({
          code: `${prefix}-${type}${subjectCounter++}`,
          name: `${type} of ${prefix}`,
          category: ["PHY", "CHM", "MAT", "BCA"].includes(prefix)
            ? "SCIENCE"
            : "COMMERCE",
          hasPractical: type === "MJC" || type === "MIC",
        });
      }
    }

    await db.insert(subjectTable).values(subjectsToInsert);
    console.log(`✅ Seeded ${subjectsToInsert.length} subjects.`);

    console.log(`🎉 Successfully seeded master tables!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
  }
}

main();
