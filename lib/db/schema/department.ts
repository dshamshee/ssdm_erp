import { sql } from "drizzle-orm";
import { integer, pgTable, varchar, timestamp, boolean, date, check } from "drizzle-orm/pg-core";

// Independent master table 
export const academicSessionTable = pgTable('academic_session', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 30 }).notNull().unique(), // review is latter / I want to generate it automatically like 2026-2030
    startDate: date().notNull(),
    endDate: date().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});



// Independent master table 
export const departmentTable = pgTable('department', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    code: varchar({ length: 10 }).notNull().unique(),
    name: varchar({ length: 30 }).notNull().unique(),
    description: varchar({ length: 100 }).notNull(), 
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});


// Independent master table 
export const subjectTable = pgTable('subject', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    code: varchar({ length: 10 }).notNull().unique(),
    name: varchar({ length: 100 }).notNull(), 
    description: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 30 }).notNull().default('MJC'), 
    hasPractical: boolean().notNull().default(false),
    practicalFee: integer().notNull().default(0),
    // courseId: integer().references(() => courseTable.id, { onDelete: 'cascade' }).notNull(),
    // semesterId: integer().references(() => semesterTable.id, { onDelete: 'set null' }),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
},
(table) => [
    check('type_check', sql`${table.type} IN ('MJC', 'MIC', 'MDC', 'SEC', 'VAC')`),
]);



//  Depends on Department
export const courseTable = pgTable('course', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull().unique(),
    code: varchar({ length: 10 }).notNull().unique(),
    type: varchar({ length: 30 }).notNull().default('UG Regular'),
    description: varchar({ length: 255 }).notNull(),
    departmentId: integer().references(() => departmentTable.id, { onDelete: 'cascade' }).notNull(),
    duration: integer().notNull().default(4), 
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
},
(table) => [
    check('duration_check', sql`${table.duration} BETWEEN 2 AND 8`),
    check('type_check', sql`${table.type} IN ('UG Regular', 'UG Part Time', 'UG Vocational', 'PG Regular', 'PG Part Time', 'PG Vocational')`),
]);



export const courseSessionTable = pgTable('course_session',{
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseId: integer().references(() => courseTable.id, { onDelete: 'cascade' }).notNull(),
    sessionId: integer().references(() => academicSessionTable.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
})


export const batchTable = pgTable('batch', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseSessionId: integer().references(() => courseSessionTable.id, { onDelete: 'cascade' }).notNull(),
    name: varchar({ length: 30 }).notNull(), // Try to generate it automatically.
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
})


// Belongs to a Course
export const semesterTable = pgTable('semester', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseSessionId: integer().references(() => courseSessionTable.id, { onDelete: 'cascade' }).notNull(),
    name: varchar({ length: 30 }).notNull(), // review is latter / I want to generate it automatically like Semester I, Semester II, etc.
    semesterNumber: integer().notNull(), // e.g., 1, 2, 3... up to (duration * 2)
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});


export const semesterSubjectTable = pgTable('semester_subject',{
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    semesterId: integer().references(() => semesterTable.id, { onDelete: 'cascade' }).notNull(),
    subjectId: integer().references(() => subjectTable.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});

// points directly to the course 
export const feeTable = pgTable('fee', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // courseId: integer().references(() => courseTable.id, { onDelete: 'cascade' }).notNull().unique(), // Unique ensures 1:1 relationship
    // sessionId: integer().references(() => sessionTable.id, { onDelete: 'cascade' }).notNull(), // flexible fee for different sessions
    // courseSessionId: integer().references(() => courseSessionTable.id, { onDelete: 'cascade' }).notNull(),
    semesterId: integer().references(() => semesterTable.id, { onDelete: 'cascade' }).notNull(),
    institution: integer().notNull().default(0),
    university: integer().notNull().default(0),
    late: integer().notNull().default(0),
    practical: integer().notNull().default(0),
    cultural: integer().notNull().default(0),
    sports: integer().notNull().default(0),
    miscellaneous: integer().notNull().default(0), 
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
});



// Something happed here 