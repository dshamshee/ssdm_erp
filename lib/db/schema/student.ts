import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import {
  batchTable,
  courseTable,
  departmentTable,
  academicSessionTable,
  subjectTable,
} from "./department";
import { json } from "zod";

// Enrolled Students
export const EnrolledStudentTable = pgTable(
  "enrolled_students",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    UAN: varchar({ length: 128 }).unique().notNull(),
    registrationNumber: text().unique(),
    aadharNumber: text().unique(),
    ABCID: text().unique(),
    universityRoll: varchar({ length: 128 }),
    name: varchar({ length: 150 }).notNull(),
    fathersName: text(),
    mothersName: text(),
    caste: text(),
    reservation: text(),
    phone: varchar({ length: 10 }).notNull(),
    email: text().unique().notNull(),
    gender: varchar({ length: 15 }).notNull(),
    DOB: date().notNull(),
    admissionType: text(),
    subMJC: varchar({ length: 128 })
      .references(() => subjectTable.id, { onDelete: "cascade" })
      .notNull(),
    subMIC: jsonb().$type<string[]>().default([]),
    subMDC: jsonb().$type<string[]>().default([]),
    subAEC: jsonb().$type<string[]>().default([]),
    subSEC: jsonb().$type<string[]>().default([]),
    subVAC: jsonb().$type<string[]>().default([]),
    batchId: varchar({ length: 128 })
      .references(() => batchTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "gender_check",
      sql`${table.gender} IN ('Male', 'Female', 'Transgender')`,
    ),
    check(
      "caste_check",
      sql`${table.caste} IN ('GEN', 'BC', 'EBC', 'SC', 'ST', 'OTHER')`,
    ),
    check(
      "admissionType_check",
      sql`${table.admissionType} IN ('MERIT', 'SPORT', 'MANAGEMENT QUOTA', 'OTHER')`,
    ),
  ],
);

// Admitted Students
export const AdmittedStudentTable = pgTable(
  "admitted_students",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    UAN: varchar({ length: 128 }).unique().notNull(),
    registrationNumber: varchar({ length: 128 }),
    universityRoll: varchar({ length: 128 }),
    collegeRoll: varchar({ length: 128 }).unique().notNull(), // Ex. UG2026290001 (Course Type, Session, Unique No.)
    admissionNumber: varchar({ length: 128 }).unique(),
    confidentialNumber: varchar({ length: 128 }).unique(),
    profileNumber: varchar({ length: 128 }),
    admissionType: text(),
    ABCID: text().unique(),
    name: varchar({ length: 150 }).notNull(),
    avatar: text().default(""),
    DOB: date().notNull(),
    AadharNumber: varchar({ length: 12 }).notNull().unique(),
    phone: varchar({ length: 10 }).notNull(),
    email: text().unique().notNull(),
    gender: varchar({ length: 15 }).notNull(),
    fathersName: varchar({ length: 50 }).notNull(),
    mothersName: varchar({ length: 50 }).notNull(),
    religion: varchar({ length: 50 }).notNull(),
    caste: varchar({ length: 50 }).notNull(),
    reservation: text(),
    isMinority: boolean().default(false),
    batchId: varchar({ length: 128 })
      .references(() => batchTable.id, { onDelete: "cascade" })
      .notNull(),
    currentSemesterCount: integer().notNull().default(1),
    subMJC: varchar({ length: 128 })
      .references(() => subjectTable.id, { onDelete: "cascade" })
      .notNull(),
    subMIC: jsonb().$type<string[]>().default([]),
    subMDC: jsonb().$type<string[]>().default([]),
    subAEC: jsonb().$type<string[]>().default([]),
    subSEC: jsonb().$type<string[]>().default([]),
    subVAC: jsonb().$type<string[]>().default([]),
    city: text().notNull(),
    district: text().notNull(),
    state: text().notNull(),
    pinCode: integer().notNull(),
    isInternshipStarted: boolean().default(false),
    internshipFee: integer().default(0),
    isProfileCompleted: boolean().notNull().default(false),
    isDetained: boolean().notNull().default(false),
    isActive: boolean().notNull().default(true),
    detainRemark: text().default(""),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "gender_check",
      sql`${table.gender} IN ('Male', 'Female', 'Transgender')`,
    ),
    check(
      "admissionType_check",
      sql`${table.admissionType} IN ('MERIT', 'SPORT', 'MANAGEMENT QUOTA', 'OTHER')`,
    ),
    check(
      "caste_check",
      sql`${table.caste} IN ('GEN', 'BC', 'EBC', 'SC', 'ST', 'OTHER')`,
    ),
  ],
);

export const StudentPreviousAcademicRecordTable = pgTable(
  "student_previous_academic_record",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    studentId: varchar({ length: 128 })
      .references(() => AdmittedStudentTable.id, { onDelete: "cascade" })
      .notNull(),

    // Higher Secondary School Records
    schoolName: text(),
    board: text(),
    obtainedMarks: integer(),
    totalMarks: integer(),
    percentage: integer(),
    rollNo: varchar({ length: 128 }),
    rollCode: varchar({ length: 128 }),
    address: text(),
    city: text(),
    district: text(),
    state: text(),
    pinCode: text(),

    // UG Records
    ugInstituteName: text(),
    ugUniversityName: text(),
    ugObtainedMarks: integer(),
    ugTotalMarks: integer(),
    ugPercentage: integer(),
    ugRollNo: varchar({ length: 128 }),
    ugAddress: text(),
    ugCity: text(),
    ugDistrict: text(),
    ugState: text(),
    ugPinCode: text(),
  },
);

export const StudentDocumentsTable = pgTable("student_documents", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  studentId: varchar({ length: 128 })
    .references(() => AdmittedStudentTable.id, { onDelete: "cascade" })
    .notNull(),
  Aadhar: text(),
  cast: text(),
  domicile: text(),
  income: text(),
  pwd: text(), // Person with Disability
  previousLC: text(),
  previousMigration: text(),
  previousMarksheet: text(),
  photo: text(),
  signature: text(),
  currentCourseMarkSheets: jsonb().$type<string[]>().default([]),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const StudentFeePaymentTable = pgTable("student_fee_payment", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  studentId: varchar({ length: 128 })
    .references(() => AdmittedStudentTable.id, { onDelete: "cascade" })
    .notNull(),
  semesterCount: integer().notNull(),
  amount: integer().notNull().default(0),
  paymentMode: varchar({ length: 30 }).notNull().default("UPI"),
  transactionId: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 30 }).notNull().default("Pending"),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Addionational table for Remarks for the student (handle by admin)
export const StudentRemarkTable = pgTable(
  "student_remark",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    studentId: varchar({ length: 128 })
      .references(() => AdmittedStudentTable.id, { onDelete: "cascade" })
      .notNull(),
    remarkBy: varchar({ length: 128 }).notNull(), // Admin/Super Admin User ID
    remarkType: varchar({ length: 30 }).notNull().default("Other"), // Academic, Attendance, Discipline, Other
    remark: text().notNull(),
    importance: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check(
      "remarkType_check",
      sql`${table.remarkType} IN ('Academic', 'Attendance', 'Discipline', 'Other')`,
    ),
    check(
      "importance_check",
      sql`${table.importance} IN ('Low', 'Medium', 'High', 'Critical')`,
    ),
  ],
);

// ─── STUDENT RELATIONS ─────────────────────────────────────────────────────────

// ENROLLED STUDENT RELATIONS

export const enrolledStudentRelations = relations(
  EnrolledStudentTable,
  ({ one }) => ({
    batch: one(batchTable, {
      fields: [EnrolledStudentTable.batchId],
      references: [batchTable.id],
    }),
    subMJC: one(subjectTable, {
      fields: [EnrolledStudentTable.subMJC],
      references: [subjectTable.id],
    }),
  }),
);

// ADMITTED STUDENT RELATIONS

export const admittedStudentRelations = relations(
  AdmittedStudentTable,
  ({ one, many }) => ({
    // currentSemester: one(semesterTable, {
    //   fields: [AdmittedStudentTable.currentSemesterId],
    //   references: [semesterTable.id],
    // }),

    previousAcademicRecord: one(StudentPreviousAcademicRecordTable),

    documents: one(StudentDocumentsTable),

    feePayments: many(StudentFeePaymentTable),

    remarks: many(StudentRemarkTable),
  }),
);

// STUDENT PREVIOUS ACADEMIC RECORD RELATIONS

export const studentPreviousAcademicRecordRelations = relations(
  StudentPreviousAcademicRecordTable,
  ({ one }) => ({
    student: one(AdmittedStudentTable, {
      fields: [StudentPreviousAcademicRecordTable.studentId],
      references: [AdmittedStudentTable.id],
    }),
  }),
);

// STUDENT DOCUMENTS RELATIONS

export const studentDocumentsRelations = relations(
  StudentDocumentsTable,
  ({ one }) => ({
    student: one(AdmittedStudentTable, {
      fields: [StudentDocumentsTable.studentId],
      references: [AdmittedStudentTable.id],
    }),
  }),
);

// STUDENT FEE PAYMENT RELATIONS

export const studentFeePaymentRelations = relations(
  StudentFeePaymentTable,
  ({ one }) => ({
    student: one(AdmittedStudentTable, {
      fields: [StudentFeePaymentTable.studentId],
      references: [AdmittedStudentTable.id],
    }),

    // semester: one(semesterTable, {
    //   fields: [StudentFeePaymentTable.semesterId],
    //   references: [semesterTable.id],
    // }),
  }),
);

// STUDENT REMARK RELATIONS

export const studentRemarkRelations = relations(
  StudentRemarkTable,
  ({ one }) => ({
    student: one(AdmittedStudentTable, {
      fields: [StudentRemarkTable.studentId],
      references: [AdmittedStudentTable.id],
    }),
  }),
);
