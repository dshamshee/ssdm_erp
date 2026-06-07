import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
  courseTable,
  batchTable,
} from "@/lib/db/schema";

// --- DEPARTMENTS POOL: Names kept under 30 characters strictly ---
const DEPARTMENTS = [
  { code: "PHYS", name: "Dept of Physics", description: "Classical mechanics, quantum dynamics, and astrophysics labs." },
  { code: "CHEM", name: "Dept of Chemistry", description: "Organic synthesis, physical chemistry, and material sciences." },
  { code: "MATH", name: "Dept of Mathematics", description: "Pure logic, advanced calculus, linear algebra, and topological studies." },
  { code: "COMP", name: "Dept of Computer Apps", description: "Full-stack development, software engineering, and database systems." },
  { code: "COMM", name: "Dept of Commerce", description: "Corporate accounting, financial management, tax laws, and market auditing." },
];

const SUBJECTS_POOL = [
  { code: "PHY-MJC1", name: "Mathematical Physics & Mechanics", category: "SCIENCE", hasPractical: true, fee: 600 },
  { code: "PHY-MJC2", name: "Electricity, Magnetism & Wave Optics", category: "SCIENCE", hasPractical: true, fee: 600 },
  { code: "PHY-MIC1", name: "Introductory General Physics", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "CHM-MJC1", name: "Basic Organic & Inorganic Principles", category: "SCIENCE", hasPractical: true, fee: 800 },
  { code: "CHM-MJC2", name: "Physical Chemistry & Thermodynamics", category: "SCIENCE", hasPractical: true, fee: 800 },
  { code: "CHM-MIC1", name: "General Chemistry Essentials", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MJC1", name: "Calculus & Analytical Geometry", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MJC2", name: "Real Analysis & Linear Algebra", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "MAT-MIC1", name: "Foundational Business Mathematics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "BCA-MJC1", name: "Object-Oriented Programming via C++", category: "SCIENCE", hasPractical: true, fee: 1000 },
  { code: "BCA-MJC2", name: "Database Management Systems & SQL", category: "SCIENCE", hasPractical: true, fee: 1000 },
  { code: "BCA-MIC1", name: "Fundamentals of IT & Office Tools", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "COM-MJC1", name: "Financial Accounting Standards", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "COM-MJC2", name: "Business Organization & Management", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "COM-MIC1", name: "General Principles of Microeconomics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "ENG-MJC1", name: "Introduction to European Classical Literature", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "ENG-MJC2", name: "Indian Classical Literature in Translation", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "ENG-MIC1", name: "Academic Writing and Rhetoric", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "SCI-MDC1", name: "Introduction to Data Science", category: "SCIENCE", hasPractical: true, fee: 500 },
  { code: "BUS-MDC1", name: "Entrepreneurship & Startup Dynamics", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "HUM-MDC1", name: "Media Communication & Journalism", category: "ARTS", hasPractical: false, fee: 0 },
  { code: "GEN-SEC1", name: "Advanced Web Styling & UI Design", category: "SCIENCE", hasPractical: true, fee: 400 },
  { code: "GEN-SEC2", name: "Digital Marketing Frameworks", category: "COMMERCE", hasPractical: false, fee: 0 },
  { code: "GEN-VAC1", name: "Environmental Studies & Eco-Systems", category: "SCIENCE", hasPractical: false, fee: 0 },
  { code: "GEN-VAC2", name: "Ethics, Culture & Human Values", category: "ARTS", hasPractical: false, fee: 0 },
];

const COURSES_POOL = [
  { deptCode: "PHYS", code: "BSC-PHYS", name: "B.Sc (Honors) Physics", type: "UG Regular", duration: 4, description: "Four-year undergraduate physics framework focusing on mechanics and theory.", perSemesterFee: 22000 },
  { deptCode: "CHEM", code: "BSC-CHEM", name: "B.Sc (Honors) Chemistry", type: "UG Regular", duration: 4, description: "Rigorous organic, inorganic, and physical laboratory chemical program.", perSemesterFee: 24000 },
  { deptCode: "MATH", code: "BSC-MATH", name: "B.Sc (Honors) Mathematics", type: "UG Regular", duration: 4, description: "Focuses on pure theory, geometry, metrics, and complex algorithms.", perSemesterFee: 12000 },
  { deptCode: "COMP", code: "BCA", name: "Bachelor of Computer Applications", type: "UG Vocational", duration: 3, description: "Three-year applied training framework mapping software, MERN, and networks.", perSemesterFee: 30000 },
  { deptCode: "COMP", code: "MCA", name: "Master of Computer Applications", type: "PG Regular", duration: 2, description: "Two-year postgraduate tier evaluating advanced microservices and computing.", perSemesterFee: 35000 },
  { deptCode: "COMM", code: "BCOM-H", name: "B.Com (Honors) Accounting", type: "UG Regular", duration: 4, description: "Comprehensive management track focusing on calculations and audits.", perSemesterFee: 10000 },
];

export async function seedDepartments() {
  const suffix = faker.string.alphanumeric(2).toUpperCase();
  console.log(`🧹 Running department seeding (Suffix: ${suffix})...`);

  try {
    // 1. Seed Academic Sessions (Format: "2024-2028")
    console.log("🌱 Seeding Academic Sessions...");
    const sessionData = [
      { startYear: 2024, duration: 4 },
      { startYear: 2025, duration: 4 },
      { startYear: 2026, duration: 4 },
    ].map(({ startYear, duration }) => {
      const endYear = startYear + duration;
      return {
        name: `${startYear}-${endYear}-${suffix}`,
        startDate: `${startYear}-07-01`,
        endDate: `${endYear}-06-30`,
      };
    });

    const insertedSessions = await db
      .insert(academicSessionTable)
      .values(sessionData)
      .returning({ id: academicSessionTable.id, name: academicSessionTable.name });

    // 2. Seed Departments
    console.log("🌱 Seeding Departments...");
    const insertedDepts = await db
      .insert(departmentTable)
      .values(DEPARTMENTS.map(d => ({ ...d, code: `${d.code}-${suffix}`.slice(0, 10), name: `${d.name} ${suffix}`.slice(0, 30) })))
      .returning({ id: departmentTable.id, code: departmentTable.code });

    // 3. Seed Subjects
    console.log("🌱 Seeding Subjects...");
    await db
      .insert(subjectTable)
      .values(
        SUBJECTS_POOL.map((sub) => ({
          code: `${sub.code}${suffix}`.slice(0, 10),
          name: `${sub.name} ${suffix}`.slice(0, 100),
          description: `Syllabus coursework for ${sub.name}.`,
          category: sub.category,
          hasPractical: sub.hasPractical,
          practicalFee: sub.fee,
        }))
      );

    // 4. Seed Courses (Linking via departmentId)
    console.log("🌱 Seeding Higher Education Courses...");
    const courseInsertValues = COURSES_POOL.map((c) => {
      const targetDeptCode = `${c.deptCode}-${suffix}`.slice(0, 10);
      const dept = insertedDepts.find((d) => d.code === targetDeptCode);
      if (!dept) throw new Error(`Department with code ${targetDeptCode} not found during seeding runtime.`);
      return {
        name: `${c.name} ${suffix}`.slice(0, 50),
        code: `${c.code}-${suffix}`.slice(0, 10),
        type: c.type,
        description: c.description,
        departmentId: dept.id,
        duration: c.duration,
      };
    });

    const finalCourses = await db
      .insert(courseTable)
      .values(courseInsertValues)
      .returning({ id: courseTable.id, code: courseTable.code, duration: courseTable.duration });

    // 5. Seed Batches (Course + Session combinations with per-semester fee)
    console.log("🌱 Seeding Batches...");

    const batchInsertValues: {
      courseId: string;
      academicSessionId: string;
      perSemesterFee: number;
    }[] = [];

    for (const course of finalCourses) {
      const poolEntry = COURSES_POOL.find(
        (c) => `${c.code}-${suffix}`.slice(0, 10) === course.code
      );
      const baseFee = poolEntry?.perSemesterFee ?? 15000;

      for (const session of insertedSessions) {
        batchInsertValues.push({
          courseId: course.id,
          academicSessionId: session.id,
          perSemesterFee: baseFee + faker.number.int({ min: -2000, max: 3000 }),
        });
      }
    }

    await db.insert(batchTable).values(batchInsertValues);

    console.log("🎉 Database successfully hydrated with fresh college data configuration!");
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
  }
}

// Allow standalone execution
seedDepartments();