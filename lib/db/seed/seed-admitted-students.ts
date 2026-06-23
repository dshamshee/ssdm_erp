import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  batchTable,
  courseTable,
  academicSessionTable,
  subjectTable,
} from "@/lib/db/schema";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { eq } from "drizzle-orm";

// --- Helpers ---

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCollegeRoll(
  courseType: string,
  sessionStartYear: number,
  index: number,
): string {
  const shortYear = String(sessionStartYear).slice(-2);
  const serial = String(index + 1).padStart(4, "0");
  return `${courseType}${shortYear}${serial}`;
}

// --- Seed Function ---

export async function seedAdmittedStudents() {
  console.log("🧹 Seeding Admitted Students across multiple sessions...");

  try {
    // 1. Clear existing admitted students
    await db.delete(AdmittedStudentTable);
    console.log("   🗑️  Cleared existing admitted students.");

    // 2. Fetch batches with their course and session info
    const batches = await db.query.batchTable.findMany({
      with: {
        course: true,
        academicSession: true,
      },
    });

    if (batches.length === 0) {
      console.error(
        "❌ No batches found. Please run the department seed first.",
      );
      process.exit(1);
    }

    // 3. Fetch MJC subjects for assigning to students
    const subjects = await db
      .select({ id: subjectTable.id, code: subjectTable.code })
      .from(subjectTable);

    const mjcSubjects = subjects.filter((s) => s.code.includes("MJC"));
    if (mjcSubjects.length === 0) {
      console.error("❌ No MJC subjects found. Cannot seed admitted students.");
      process.exit(1);
    }

    const GENDERS = ["Male", "Female", "Transgender"] as const;
    const CASTES = ["GEN", "BC", "EBC", "SC", "ST", "OTHER"] as const;
    const ADMISSION_TYPES = [
      "MERIT",
      "SPORT",
      "MANAGEMENT QUOTA",
      "OTHER",
    ] as const;
    const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain"] as const;

    let globalIndex = 0;
    const studentsToInsert = [];

    // 4. For each batch, seed 5-8 students
    for (const batch of batches) {
      const course = batch.course;
      const session = batch.academicSession;
      const maxSemester = course.duration * 2; // e.g., 4 years = 8 semesters
      const sessionStartYear = Number(session.startDate.slice(0, 4));

      // Determine course type prefix from course code
      const courseTypePrefix = course.type.startsWith("UG") ? "UG" : "PG";

      // Pick a matching MJC subject for this department
      const deptMjcSubjects = mjcSubjects.filter((s) => {
        const prefix = s.code.split("-")[0];
        return (
          (course.code.includes("PHYS") && prefix === "PHY") ||
          (course.code.includes("CHEM") && prefix === "CHM") ||
          (course.code.includes("MATH") && prefix === "MAT") ||
          (course.code.includes("COMP") && prefix === "BCA") ||
          (course.code.includes("COMM") && prefix === "COM")
        );
      });

      const mjcToUse =
        deptMjcSubjects.length > 0
          ? deptMjcSubjects[0]
          : pickRandom(mjcSubjects);

      const studentsPerBatch = Math.floor(Math.random() * 4) + 5; // 5-8 students

      for (let i = 0; i < studentsPerBatch; i++) {
        globalIndex++;

        // Assign varying semester counts (1-8 for 4-year courses)
        // If the session is 2026-2030, all students are in the same semester (Semester 1)
        const semesterCount = session.name === "2026-2030" ? 1 : ((i % maxSemester) + 1);

        // Some students in later semesters may be passed
        const isPassed = semesterCount >= maxSemester && Math.random() > 0.5;

        // Occasional detained students
        const isDetained = !isPassed && Math.random() > 0.85;

        studentsToInsert.push({
          UAN: `UAN-${sessionStartYear}-${String(globalIndex).padStart(6, "0")}`,
          registrationNumber: `REG-${faker.string.numeric(10)}`,
          universityRoll: `UR-${faker.string.numeric(8)}`,
          collegeRoll: generateCollegeRoll(
            courseTypePrefix,
            sessionStartYear,
            globalIndex,
          ),
          admissionNumber: `ADM-${sessionStartYear}-${String(globalIndex).padStart(4, "0")}`,
          confidentialNumber: `CONF-${faker.string.numeric(8)}`,
          profileNumber: `PRF-${String(globalIndex).padStart(6, "0")}`,
          admissionType: pickRandom([...ADMISSION_TYPES]),
          ABCID: `ABC-${faker.string.numeric(12)}`,
          name: faker.person.fullName(),
          avatar: "",
          DOB: faker.date
            .birthdate({ min: 17, max: 25, mode: "age" })
            .toISOString()
            .split("T")[0],
          AadharNumber: faker.string.numeric(12),
          phone: faker.string.numeric(10),
          email: faker.internet
            .email({ firstName: `student${globalIndex}` })
            .toLowerCase(),
          gender: pickRandom([...GENDERS]),
          fathersName: faker.person.fullName(),
          mothersName: faker.person.fullName(),
          religion: pickRandom([...RELIGIONS]),
          caste: pickRandom([...CASTES]),
          reservation: pickRandom(["NONE", "DEFENCE", "SPORTS", null]),
          isMinority: Math.random() > 0.8,
          batchId: batch.id,
          currentSemesterCount: semesterCount,
          subMJC: mjcToUse.id,
          subMIC: [],
          subMDC: [],
          subAEC: [],
          subSEC: [],
          subVAC: [],
          city: faker.location.city(),
          district: faker.location.county(),
          state: faker.location.state(),
          pinCode: Number.parseInt(
            faker.string.numeric({ length: 6, allowLeadingZeros: false }),
          ),
          isInternshipStarted: false,
          internshipFee: 0,
          isProfileCompleted: true,
          isDetained,
          isPassed,
          isActive: !isPassed,
          detainRemark: isDetained ? "Poor attendance" : "",
        });
      }
    }

    // 5. Bulk insert
    const inserted = await db
      .insert(AdmittedStudentTable)
      .values(studentsToInsert)
      .returning({
        id: AdmittedStudentTable.id,
        UAN: AdmittedStudentTable.UAN,
      });

    console.log(
      `   ✅ Seeded ${inserted.length} admitted students across ${batches.length} batches.`,
    );
    console.log("🎉 Admitted student seeding completed!");
  } catch (error) {
    console.error("❌ Admitted student seeding failed:", error);
    process.exit(1);
  }
}

// Allow standalone execution
seedAdmittedStudents();
