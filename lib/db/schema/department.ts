import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Independent master table
export const academicSessionTable = pgTable("academic_session", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar({ length: 30 }).notNull().unique(), // review is latter / I want to generate it automatically like 2026-2030
  startDate: date().notNull(),
  endDate: date().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Add departments Details D card, course card, session

// Independent master table
export const departmentTable = pgTable("department", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  code: varchar({ length: 10 }).notNull().unique(),
  name: varchar({ length: 30 }).notNull().unique(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Independent master table
export const subjectTable = pgTable(
  "subject",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    code: varchar({ length: 10 }).notNull().unique(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    // type: varchar({
    //   length: 30,
    // })
    //   .notNull()
    //   .default("MJC"),
    category: varchar({ length: 15 }).notNull().default("SCIENCE"),
    isActive: boolean().default(true),
    hasPractical: boolean().notNull().default(false),
    practicalFee: integer().default(0), // This field is optional (It is for the future requirement)
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    // check(
    //   "type_check",
    //   sql`${table.type} IN ('MJC', 'MIC', 'MDC', 'SEC', 'VAC')`,
    // ),
    check(
      "category_check",
      sql`${table.category} IN ('SCIENCE', 'COMMERCE', 'ARTS')`,
    ),
  ],
);

//  Depends on Department
export const courseTable = pgTable(
  "course",
  {
    id: varchar({ length: 128 })
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar({ length: 50 }).notNull().unique(),
    code: varchar({ length: 10 }).notNull().unique(),
    type: varchar({ length: 30 }).notNull().default("UG Regular"),
    description: text(),
    departmentId: varchar({ length: 128 })
      .references(() => departmentTable.id, { onDelete: "cascade" })
      .notNull(),
    duration: integer().notNull().default(4),
    isActive: boolean().default(true),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    check("duration_check", sql`${table.duration} BETWEEN 2 AND 8`),
    check(
      "type_check",
      sql`${table.type} IN ('UG Regular', 'UG Part Time', 'UG Vocational', 'PG Regular', 'PG Part Time', 'PG Vocational')`,
    ),
  ],
);

export const batchTable = pgTable("batch", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  courseId: varchar({ length: 128 })
    .references(() => courseTable.id, { onDelete: "cascade" })
    .notNull(),
  academicSessionId: varchar({ length: 128 })
    .references(() => academicSessionTable.id, { onDelete: "cascade" })
    .notNull(),
  perSemesterFee: integer().notNull(),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// This is for check which batch admission is started
export const admissionOpenTable = pgTable("admission_open", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  batchId: varchar({ length: 128 })
    .references(() => batchTable.id, { onDelete: "cascade" })
    .notNull(),
  startDate: date().notNull(),
  endDate: date().notNull(),
  lateFee: integer().default(0),
  isDateExtended: boolean().default(false),
  extendedDate: date(), // This field is optional (you can also extend the endDate otherwise set the new date in it)
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// This table is for tender
export const tenderTable = pgTable("tender", {
  id: varchar({ length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text().notNull(),
  description: text(),
  startDate: date().notNull(),
  endDate: date().notNull(),
  document: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// export const batchTable = pgTable("batch", {
//   id: varchar({ length: 128 })
//     .primaryKey()
//     .$defaultFn(() => createId()),
//   courseSessionId: varchar({ length: 128 })
//     .references(() => courseSessionTable.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   name: varchar({
//     length: 30,
//   }).notNull(), // Try to generate it automatically.
//   createdAt: timestamp().defaultNow().notNull(),
//   updatedAt: timestamp().defaultNow().notNull(),
// });

// // Belongs to a Course
// export const semesterTable = pgTable("semester", {
//   id: varchar({ length: 128 })
//     .primaryKey()
//     .$defaultFn(() => createId()),
//   courseSessionId: varchar({ length: 128 })
//     .references(() => courseSessionTable.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   name: varchar({
//     length: 30,
//   }).notNull(), // review is latter / I want to generate it automatically like Semester I, Semester II, etc.
//   semesterNumber: integer().notNull(), // e.g., 1, 2, 3... up to (duration * 2)
//   createdAt: timestamp().defaultNow().notNull(),
//   updatedAt: timestamp().defaultNow().notNull(),
// });

// export const semesterSubjectTable = pgTable("semester_subject", {
//   id: varchar({ length: 128 })
//     .primaryKey()
//     .$defaultFn(() => createId()),
//   semesterId: varchar({ length: 128 })
//     .references(() => semesterTable.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   subjectId: varchar({ length: 128 })
//     .references(() => subjectTable.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   createdAt: timestamp().defaultNow().notNull(),
//   updatedAt: timestamp().defaultNow().notNull(),
// });

// // points directly to the course
// export const feeTable = pgTable("fee", {
//   id: varchar({ length: 128 })
//     .primaryKey()
//     .$defaultFn(() => createId()),
//   semesterId: varchar({ length: 128 })
//     .references(() => semesterTable.id, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   institution: integer().notNull().default(0),
//   university: integer().notNull().default(0),
//   late: integer().notNull().default(0),
//   practical: integer().notNull().default(0),
//   cultural: integer().notNull().default(0),
//   sports: integer().notNull().default(0),
//   miscellaneous: integer().notNull().default(0),
//   createdAt: timestamp().defaultNow().notNull(),
//   updatedAt: timestamp().defaultNow().notNull(),
// });

// DEPARTMENT RELATIONS

export const departmentRelations = relations(departmentTable, ({ many }) => ({
  courses: many(courseTable),
}));

// COURSE RELATIONS

export const courseRelations = relations(courseTable, ({ one, many }) => ({
  department: one(departmentTable, {
    fields: [courseTable.departmentId],
    references: [departmentTable.id],
  }),

  batches: many(batchTable),
}));

// ACADEMIC SESSION RELATIONS

export const academicSessionRelations = relations(
  academicSessionTable,
  ({ many }) => ({ batches: many(batchTable) }),
);

// COURSE SESSION (batch table) RELATIONS

export const courseSessionRelations = relations(
  batchTable,
  ({ one, many }) => ({
    course: one(courseTable, {
      fields: [batchTable.courseId],
      references: [courseTable.id],
    }),

    academicSession: one(academicSessionTable, {
      fields: [batchTable.academicSessionId],
      references: [academicSessionTable.id],
    }),

    admissionOpen: many(admissionOpenTable),
  }),
);

// ADMISSION OPEN RELATIONS

export const admissionOpenRelations = relations(
  admissionOpenTable,
  ({ one }) => ({
    batch: one(batchTable, {
      fields: [admissionOpenTable.batchId],
      references: [batchTable.id],
    }),
  }),
);

// BATCH RELATIONS

// export const batchRelations = relations(batchTable, ({ one }) => ({
//   courseSession: one(batchTable, {
//     fields: [batchTable.courseSessionId],
//     references: [courseSessionTable.id],
//   }),
// }));

// SEMESTER RELATIONS

// export const semesterRelations = relations(semesterTable, ({ one, many }) => ({
//   courseSession: one(courseSessionTable, {
//     fields: [semesterTable.courseSessionId],
//     references: [courseSessionTable.id],
//   }),

//   semesterSubjects: many(semesterSubjectTable),

//   fees: many(feeTable),
// }));

// SUBJECT RELATIONS

// export const subjectRelations = relations(subjectTable, ({ many }) => ({
//   semesterSubjects: many(semesterSubjectTable),
// }));

// // SEMESTER SUBJECT RELATIONS

// export const semesterSubjectRelations = relations(
//   semesterSubjectTable,
//   ({ one }) => ({
//     semester: one(semesterTable, {
//       fields: [semesterSubjectTable.semesterId],
//       references: [semesterTable.id],
//     }),

//     subject: one(subjectTable, {
//       fields: [semesterSubjectTable.subjectId],
//       references: [subjectTable.id],
//     }),
//   }),
// );

// // FEE RELATIONS

// export const feeRelations = relations(feeTable, ({ one }) => ({
//   semester: one(semesterTable, {
//     fields: [feeTable.semesterId],
//     references: [semesterTable.id],
//   }),
// }));
