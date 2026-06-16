import { db } from "@/lib/db";
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
  courseTable,
  batchTable,
  admissionOpenTable,
  tenderTable,
} from "@/lib/db/schema";

const NUM_RECORDS = 5;

async function main() {
  console.log(`🌱 Seeding master tables for students...`);
  try {
    // Clear existing data to prevent unique constraint errors
    await db.delete(admissionOpenTable);
    await db.delete(tenderTable);
    await db.delete(batchTable);
    await db.delete(courseTable);
    await db.delete(subjectTable);
    await db.delete(departmentTable);
    await db.delete(academicSessionTable);

    // 1. Seed Academic Sessions
    const currentYear = new Date().getFullYear();
    const sessions = Array.from({ length: NUM_RECORDS }).map((_, i) => {
      const startYear = currentYear - NUM_RECORDS + 1 + i;
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
      startDate: `${currentYear}-06-01`,
      endDate: `${currentYear}-07-31`,
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

    // 6. Seed Tenders
    const tenders = [
      {
        title: "Tender for Construction of New Central Library Building",
        description:
          "Sealed percentage rate tenders are invited from experienced and registered contractors of appropriate class.",
        startDate: `${currentYear}-06-01`,
        endDate: `${currentYear}-07-15`,
        document: "/tenders/library-construction.pdf",
      },
      {
        title:
          "Tender for Supply of Laboratory Instruments (Physics & Chemistry)",
        description:
          "Bids are invited for the supply, installation, testing and commissioning of laboratory equipments.",
        startDate: `${currentYear}-06-05`,
        endDate: `${currentYear}-06-30`,
        document: "/tenders/lab-instruments.pdf",
      },
      {
        title: "Tender for College Wi-Fi Networking & CCTV Installation",
        description:
          "Installation of high-speed Wi-Fi access points and CCTV security network across the campus.",
        startDate: `${currentYear}-06-08`,
        endDate: `${currentYear}-06-28`,
        document: "/tenders/wifi-cctv-setup.pdf",
      },
    ];

    await db.insert(tenderTable).values(tenders);
    console.log(`✅ Seeded ${tenders.length} tenders.`);

    console.log(`🎉 Successfully seeded master tables!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
  }
}

main();
