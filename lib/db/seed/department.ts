import { faker } from "@faker-js/faker";
import { db } from "@/lib/db"; // Adjust path to your database connection file
import { sql } from "drizzle-orm";
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
  courseTable,
  courseSessionTable,
  batchTable,
  semesterTable,
  semesterSubjectTable,
  feeTable,
} from "@/lib/db/schema"; // Adjust path to your schema definitions

// --- DEPARTMENTS POOL: Names kept under 30 characters strictly ---
const DEPARTMENTS = [
  { code: "PHYS", name: "Dept of Physics", description: "Classical mechanics, quantum dynamics, and astrophysics labs." },
  { code: "CHEM", name: "Dept of Chemistry", description: "Organic synthesis, physical chemistry, and material sciences." },
  { code: "MATH", name: "Dept of Mathematics", description: "Pure logic, advanced calculus, linear algebra, and topological studies." },
  { code: "COMP", name: "Dept of Computer Apps", description: "Full-stack development, software engineering, and database systems." },
  { code: "COMM", name: "Dept of Commerce", description: "Corporate accounting, financial management, tax laws, and market auditing." },
  { code: "ENGL", name: "Dept of English Lit", description: "Classical poetry, modern drama, linguistics, and literary criticism." },
];

const SUBJECTS_POOL = [
  { code: "PHY-MJC1", name: "Mathematical Physics & Mechanics", type: "MJC", hasPractical: true, fee: 600 },
  { code: "PHY-MJC2", name: "Electricity, Magnetism & Wave Optics", type: "MJC", hasPractical: true, fee: 600 },
  { code: "PHY-MIC1", name: "Introductory General Physics", type: "MIC", hasPractical: false, fee: 0 },
  { code: "CHM-MJC1", name: "Basic Organic & Inorganic Principles", type: "MJC", hasPractical: true, fee: 800 },
  { code: "CHM-MJC2", name: "Physical Chemistry & Thermodynamics", type: "MJC", hasPractical: true, fee: 800 },
  { code: "CHM-MIC1", name: "General Chemistry Essentials", type: "MIC", hasPractical: false, fee: 0 },
  { code: "MAT-MJC1", name: "Calculus & Analytical Geometry", type: "MJC", hasPractical: false, fee: 0 },
  { code: "MAT-MJC2", name: "Real Analysis & Linear Algebra", type: "MJC", hasPractical: false, fee: 0 },
  { code: "MAT-MIC1", name: "Foundational Business Mathematics", type: "MIC", hasPractical: false, fee: 0 },
  { code: "BCA-MJC1", name: "Object-Oriented Programming via C++", type: "MJC", hasPractical: true, fee: 1000 },
  { code: "BCA-MJC2", name: "Database Management Systems & SQL", type: "MJC", hasPractical: true, fee: 1000 },
  { code: "BCA-MIC1", name: "Fundamentals of IT & Office Tools", type: "MIC", hasPractical: false, fee: 0 },
  { code: "COM-MJC1", name: "Financial Accounting Standards", type: "MJC", hasPractical: false, fee: 0 },
  { code: "COM-MJC2", name: "Business Organization & Management", type: "MJC", hasPractical: false, fee: 0 },
  { code: "COM-MIC1", name: "General Principles of Microeconomics", type: "MIC", hasPractical: false, fee: 0 },
  { code: "ENG-MJC1", name: "Introduction to European Classical Literature", type: "MJC", hasPractical: false, fee: 0 },
  { code: "ENG-MJC2", name: "Indian Classical Literature in Translation", type: "MJC", hasPractical: false, fee: 0 },
  { code: "ENG-MIC1", name: "Academic Writing and Rhetoric", type: "MIC", hasPractical: false, fee: 0 },
  { code: "SCI-MDC1", name: "Introduction to Data Science", type: "MDC", hasPractical: true, fee: 500 },
  { code: "BUS-MDC1", name: "Entrepreneurship & Startup Dynamics", type: "MDC", hasPractical: false, fee: 0 },
  { code: "HUM-MDC1", name: "Media Communication & Journalism", type: "MDC", hasPractical: false, fee: 0 },
  { code: "GEN-SEC1", name: "Advanced Web Styling & UI Design", type: "SEC", hasPractical: true, fee: 400 },
  { code: "GEN-SEC2", name: "Digital Marketing Frameworks", type: "SEC", hasPractical: false, fee: 0 },
  { code: "GEN-VAC1", name: "Environmental Studies & Eco-Systems", type: "VAC", hasPractical: false, fee: 0 },
  { code: "GEN-VAC2", name: "Ethics, Culture & Human Values", type: "VAC", hasPractical: false, fee: 0 },
];

const COURSES_POOL = [
  { deptCode: "PHYS", code: "BSC-PHYS", name: "B.Sc (Honors) Physics", type: "UG Regular", duration: 4, description: "Four-year undergraduate physics framework focusing on mechanics and theory." },
  { deptCode: "CHEM", code: "BSC-CHEM", name: "B.Sc (Honors) Chemistry", type: "UG Regular", duration: 4, description: "Rigorous organic, inorganic, and physical laboratory chemical program." },
  { deptCode: "MATH", code: "BSC-MATH", name: "B.Sc (Honors) Mathematics", type: "UG Regular", duration: 4, description: "Focuses on pure theory, geometry, metrics, and complex algorithms." },
  { deptCode: "COMP", code: "BCA", name: "Bachelor of Computer Applications", type: "UG Vocational", duration: 3, description: "Three-year applied training framework mapping software, MERN, and networks." },
  { deptCode: "COMP", code: "MCA", name: "Master of Computer Applications", type: "PG Regular", duration: 2, description: "Two-year postgraduate tier evaluating advanced microservices and computing." },
  { deptCode: "COMM", code: "BCOM-H", name: "B.Com (Honors) Accounting", type: "UG Regular", duration: 4, description: "Comprehensive management track focusing on calculations and audits." },
  { deptCode: "ENGL", code: "BA-ENGL", name: "BA (Honors) English Literature", type: "UG Regular", duration: 4, description: "Evaluates historical global creative movements and literature." },
];

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

async function main() {
  console.log("🧹 Running script-level database cleanup safely...");

  try {
    // Clean out all the old table items cascading backwards to clear structural constraints
    await db.execute(sql`
      TRUNCATE TABLE "fee", "semester_subject", "semester", "batch", "course_session", "course", "subject", "department", "academic_session" RESTART IDENTITY CASCADE;
    `);
    console.log("✨ Tables cleared locally via current Bun environment.");

    // 2. Seed Academic Sessions (Format: "2024-2028")
    console.log("🌱 Seeding Academic Sessions...");
    const sessionData = [
      { startYear: 2024, duration: 4 },
      { startYear: 2025, duration: 4 },
      { startYear: 2026, duration: 4 },
    ].map(({ startYear, duration }) => {
      const endYear = startYear + duration;
      return {
        name: `${startYear}-${endYear}`, // Fits perfectly under the varchar(30) limit
        startDate: `${startYear}-07-01`,
        endDate: `${endYear}-06-30`,
      };
    });

    const insertedSessions = await db
      .insert(academicSessionTable)
      .values(sessionData)
      .returning({ id: academicSessionTable.id, name: academicSessionTable.name });

    // 3. Seed Departments
    console.log("🌱 Seeding Departments...");
    const insertedDepts = await db
      .insert(departmentTable)
      .values(DEPARTMENTS)
      .returning({ id: departmentTable.id, code: departmentTable.code });

    // 4. Seed Subjects
    console.log("🌱 Seeding Subjects...");
    const finalSubjects = await db
      .insert(subjectTable)
      .values(
        SUBJECTS_POOL.map((sub) => ({
          code: sub.code,
          name: sub.name,
          description: `Syllabus coursework for ${sub.name}.`,
          type: sub.type,
          hasPractical: sub.hasPractical,
          practicalFee: sub.fee,
        }))
      )
      .returning({ id: subjectTable.id, code: subjectTable.code, type: subjectTable.type });

    // 5. Seed Courses (Linking via numeric departmentId)
    console.log("🌱 Seeding Higher Education Courses...");
    const courseInsertValues = COURSES_POOL.map((c) => {
      const dept = insertedDepts.find((d) => d.code === c.deptCode);
      if (!dept) throw new Error(`Department with code ${c.deptCode} not found during seeding runtime.`);
      return {
        name: c.name,
        code: c.code,
        type: c.type,
        description: c.description,
        departmentId: dept.id, // Numeric references injection
        duration: c.duration,
      };
    });

    const finalCourses = await db
      .insert(courseTable)
      .values(courseInsertValues)
      .returning({ id: courseTable.id, code: courseTable.code, duration: courseTable.duration });

    // 6. Seed Course Sessions Junction Table
    console.log("🌱 Constructing Course-Session mappings...");
    const courseSessionData = [];

    for (const course of finalCourses) {
      for (const session of insertedSessions) {
        courseSessionData.push({
          courseId: course.id,
          sessionId: session.id,
        });
      }
    }

    const finalCourseSessions = await db
      .insert(courseSessionTable)
      .values(courseSessionData)
      .returning({ id: courseSessionTable.id, courseId: courseSessionTable.courseId, sessionId: courseSessionTable.sessionId });

    // 7. Deep Cascaded Loop Setup (Batches, Semesters, Fees, and Subjects)
    console.log("🌱 Executing deep relational cascade setup...");

    for (const cs of finalCourseSessions) {
      const parentCourse = finalCourses.find((c) => c.id === cs.courseId);
      const parentSession = insertedSessions.find((s) => s.id === cs.sessionId);
      if (!parentCourse || !parentSession) continue;

      // Seed Batches (Automatically naming e.g., "BCA (2024-2028)")
      // Slicing at 30 characters maximum to respect batchTable.name length constraint!
      const batchName = `${parentCourse.code} (${parentSession.name})`.slice(0, 30);
      await db.insert(batchTable).values({
        courseSessionId: cs.id,
        name: batchName,
      });

      // Compute total semesters (duration * 2)
      const totalSemesters = parentCourse.duration * 2;

      for (let semNum = 1; semNum <= totalSemesters; semNum++) {
        const roman = ROMAN_NUMERALS[(semNum - 1) % ROMAN_NUMERALS.length] || semNum.toString();
        
        // Seed Semesters (e.g., "Semester I")
        const [insertedSemester] = await db
          .insert(semesterTable)
          .values({
            courseSessionId: cs.id,
            name: `Semester ${roman}`,
            semesterNumber: semNum,
          })
          .returning({ id: semesterTable.id });

        // Seed Associated Structural Fees tailored by program stream 
        const isTechOrScience = ["BCA", "MCA", "BSC-PHYS", "BSC-CHEM"].includes(parentCourse.code);
        await db.insert(feeTable).values({
          semesterId: insertedSemester.id,
          institution: isTechOrScience ? faker.number.int({ min: 18000, max: 26000 }) : faker.number.int({ min: 8000, max: 14000 }),
          university: faker.number.int({ min: 2000, max: 4000 }),
          late: 300,
          practical: isTechOrScience ? 1500 : 0,
          cultural: 250,
          sports: 250,
          miscellaneous: 500,
        });

        // --- Realistic Subject Assignment Business Logic ---
        const targetedSubjectIds: number[] = [];
        const coursePrefix = parentCourse.code.includes("-") ? parentCourse.code.split("-")[1] : parentCourse.code;
        const prefixMatch = coursePrefix.slice(0, 3); // e.g., "PHY", "BCA", "CHE"

        // 1. Core Paper (MJC) -> Matches the stream prefix
        const corePaper = finalSubjects.find((s) => s.type === "MJC" && s.code.startsWith(prefixMatch));
        if (corePaper) targetedSubjectIds.push(corePaper.id);

        // 2. Subsidiary Paper (MIC) -> Separate elective domain
        const subsidiaryPaper = finalSubjects.find((s) => s.type === "MIC" && !s.code.startsWith(prefixMatch));
        if (subsidiaryPaper) targetedSubjectIds.push(subsidiaryPaper.id);

        // 3. Multi-Disciplinary (MDC) -> Elective course
        const mdcPaper = finalSubjects.find((s) => s.type === "MDC" && !s.code.startsWith(prefixMatch));
        if (mdcPaper) targetedSubjectIds.push(mdcPaper.id);

        // 4. Common Skill Competency / Values (SEC / VAC)
        const skillPaper = finalSubjects.find((s) => s.type === "SEC" || s.type === "VAC");
        if (skillPaper) targetedSubjectIds.push(skillPaper.id);

        // Map arrays into the semester-subject junction table
        const semesterSubjectEntries = targetedSubjectIds.map((subId) => ({
          semesterId: insertedSemester.id,
          subjectId: subId,
        }));

        if (semesterSubjectEntries.length > 0) {
          // Filter duplicates before firing execution query
          const uniqueEntries = Array.from(new Map(semesterSubjectEntries.map(item => [item.subjectId, item])).values());
          await db.insert(semesterSubjectTable).values(uniqueEntries);
        }
      }
    }

    console.log("🎉 Database successfully hydrated with fresh college data configuration!");
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
  }
}

main();