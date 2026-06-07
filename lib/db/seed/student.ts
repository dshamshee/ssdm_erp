import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  batchTable,
  courseTable,
  departmentTable,
  subjectTable,
} from "@/lib/db/schema";
import { EnrolledStudentTable } from "../schema/student";

// --- Helpers ---

/** Generate a unique UAN like "UAN-2026-XXXXXX" */
function generateUAN(index: number): string {
  const year = new Date().getFullYear();
  const serial = String(index + 1).padStart(6, "0");
  return `UAN-${year}-${serial}`;
}

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick N random unique elements from an array */
function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// --- Data Pools ---

const GENDERS = ["Male", "Female", "Transgender"] as const;

/**
 * Maps MJC subject code prefixes to department code prefixes.
 * E.g., a student who picks "PHY-MJC1" as MJC belongs to the PHYS department.
 */
const MJC_PREFIX_TO_DEPT_PREFIX: Record<string, string> = {
  "PHY": "PHYS",
  "CHM": "CHEM",
  "MAT": "MATH",
  "BCA": "COMP",
  "COM": "COMM",
};

// --- Student Seed Function ---

export async function seedStudents() {
  console.log("🧹 Running student seeding (Enrolled Students Only)...");

  try {
    // 1. Fetch existing data (prerequisite: department seed must have run)
    const departments = await db.select({ id: departmentTable.id, code: departmentTable.code }).from(departmentTable);
    const courses = await db.select({ id: courseTable.id, code: courseTable.code, departmentId: courseTable.departmentId }).from(courseTable);
    const batches = await db.select({ id: batchTable.id, courseId: batchTable.courseId }).from(batchTable);
    const subjects = await db.select({ id: subjectTable.id, code: subjectTable.code }).from(subjectTable);

    if (departments.length === 0 || courses.length === 0 || batches.length === 0 || subjects.length === 0) {
      console.error("❌ No department/course/batch/subject data found. Please run the department seed first.");
      process.exit(1);
    }

    // Categorize subjects by their type prefix (MJC, MIC, MDC, SEC, VAC)
    const mjcSubjects = subjects.filter((s) => s.code.includes("MJC"));
    const micSubjects = subjects.filter((s) => s.code.includes("MIC"));
    const mdcSubjects = subjects.filter((s) => s.code.includes("MDC"));
    const secSubjects = subjects.filter((s) => s.code.includes("SEC"));
    const vacSubjects = subjects.filter((s) => s.code.includes("VAC"));

    if (mjcSubjects.length === 0) {
      console.error("❌ No MJC subjects found. Cannot seed students without MJC subjects.");
      process.exit(1);
    }

    /**
     * Given an MJC subject, find a matching batch:
     * MJC subject code prefix (e.g. "PHY") → department prefix (e.g. "PHYS")
     * → department → course in that department → batch for that course
     */
    function findBatchForMJC(mjcSubject: { id: string; code: string }) {
      const subjectPrefix = mjcSubject.code.split("-")[0];
      const deptPrefix = MJC_PREFIX_TO_DEPT_PREFIX[subjectPrefix];
      if (!deptPrefix) return null;

      const dept = departments.find((d) => d.code.startsWith(deptPrefix));
      if (!dept) return null;

      const deptCourses = courses.filter((c) => c.departmentId === dept.id);
      if (deptCourses.length === 0) return null;

      const course = pickRandom(deptCourses);

      const courseBatches = batches.filter((b) => b.courseId === course.id);
      if (courseBatches.length === 0) return null;

      return { batch: pickRandom(courseBatches), course, dept };
    }

    // 2. Seed Enrolled Students (pre-admission pipeline)
    console.log("🌱 Seeding Enrolled Students...");
    const ENROLLED_COUNT = 30;
    const enrolledValues = [];

    for (let i = 0; i < ENROLLED_COUNT; i++) {
      const mjcSubject = pickRandom(mjcSubjects);
      const match = findBatchForMJC(mjcSubject);
      if (!match) continue;

      // MIC subjects should preferably be from a different department than MJC
      const otherMicSubjects = micSubjects.filter(
        (s) => !s.code.startsWith(mjcSubject.code.split("-")[0])
      );

      // Pick random subjects for all categories
      const selectedMic = otherMicSubjects.length > 0 
        ? [pickRandom(otherMicSubjects).id] 
        : [];
      
      const selectedMdc = mdcSubjects.length > 0 
        ? [pickRandom(mdcSubjects).id] 
        : [];
      
      const selectedSec = secSubjects.length > 0 
        ? [pickRandom(secSubjects).id] 
        : [];
      
      const selectedVac = vacSubjects.length > 0 
        ? [pickRandom(vacSubjects).id] 
        : [];

      enrolledValues.push({
        UAN: generateUAN(i),
        name: faker.person.fullName(),
        gender: pickRandom([...GENDERS]),
        subMJC: mjcSubject.id,
        subMIC: selectedMic,
        subMDC: selectedMdc,
        subSEC: selectedSec,
        subVAC: selectedVac,
        batchId: match.batch.id,
      });
    }

    // Clear previous enrolled students to avoid UAN collisions
    await db.delete(EnrolledStudentTable);

    const insertedEnrolled = await db
      .insert(EnrolledStudentTable)
      .values(enrolledValues)
      .returning({ id: EnrolledStudentTable.id, UAN: EnrolledStudentTable.UAN });

    console.log(`   ✅ Enrolled ${insertedEnrolled.length} students seeded successfully.`);
    console.log("🎉 Student seeding completed successfully!");
  } catch (error) {
    console.error("❌ Student seeding failed:", error);
    process.exit(1);
  }
}

// Allow standalone execution
seedStudents();
