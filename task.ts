//  {
//     UAN: varchar({ length: 128 }).unique().notNull(),
//     registrationNumber: varchar({ length: 128 }).unique(),
//     universityRoll: varchar({ length: 128 }).unique(),
//     collegeRoll: varchar({ length: 128 }).unique().notNull(), // Ex. UG2026290001 (Course Type, Session, Unique No.)
//     admissionNumber: varchar({ length: 128 }).unique(),
//     confidentialNumber: varchar({ length: 128 }).unique(),
//     profileNumber: varchar({ length: 128 }).unique(),
//     admissionType: text(),
//     ABCID: text().unique(),
//     name: varchar({ length: 150 }).notNull(),
//     avatar: text().default(""),
//     DOB: date().notNull(),
//     AadharNumber: varchar({ length: 12 }).notNull().unique(),
//     phone: varchar({ length: 10 }).notNull(),
//     email: text().unique().notNull(),
//     gender: varchar({ length: 15 }).notNull(),
//     fathersName: varchar({ length: 50 }).notNull(),
//     mothersName: varchar({ length: 50 }).notNull(),
//     religion: varchar({ length: 50 }).notNull(),
//     caste: varchar({ length: 50 }).notNull(),
//     reservation: text(),
//     isMinority: boolean().default(false),
//     batchId: varchar({ length: 128 })
//       .references(() => batchTable.id, { onDelete: "cascade" })
//       .notNull(),
//     currentSemesterCount: integer().notNull().default(1),
//     subMJC: varchar({ length: 128 })
//       .references(() => subjectTable.id, { onDelete: "cascade" })
//       .notNull(),
//     subMIC: jsonb().$type<string[]>().default([]),
//     subMDC: jsonb().$type<string[]>().default([]),
//     subAEC: jsonb().$type<string[]>().default([]),
//     subSEC: jsonb().$type<string[]>().default([]),
//     subVAC: jsonb().$type<string[]>().default([]),
//     city: text().notNull(),
//     district: text().notNull(),
//     state: text().notNull(),
//     pinCode: integer().notNull(),
//     isInternshipStarted: boolean().default(false),
//     internshipFee: integer().default(0),
//     isProfileCompleted: boolean().notNull().default(false),
//     isDetained: boolean().notNull().default(false),
//     isPassed: boolean().notNull().default(false),
//     isActive: boolean().notNull().default(true),
//     detainRemark: text().default(""),
//     createdAt: timestamp().defaultNow().notNull(),
//     updatedAt: timestamp().defaultNow().notNull(),
//   },
//   (table) => [
//     check(
//       "gender_check",
//       sql`${table.gender} IN ('Male', 'Female', 'Transgender')`,
//     ),
//     check(
//       "admissionType_check",
//       sql`${table.admissionType} IN ('MERIT', 'SPORT', 'MANAGEMENT QUOTA', 'OTHER')`,
//     ),
//     check(
//       "caste_check",
//       sql`${table.caste} IN ('GEN', 'BC', 'EBC', 'SC', 'ST', 'OTHER')`,
//     ),
// [//   ],
// );




// {
//   UAN:
//   registrationNumber: 
//   subMJC:
//   batchId: 
//   caste: 
//   name: 
//   email: 
//   phone: 
//   gender: 
//   reservation: 
//   aadharNumber: 
//   fathersName: 
//   mothersName: 
//   DOB: 
//   subMIC:
//   subMDC:
//   subAEC:
//   subVAC:
//   subSEC:
// }


// [
//   {
//     UAN:"PPUP0000001",
//     registrationNumber: "2345",
//     subMJC:"",
//     universityRoll:"4567",
//     batchId: "",
//     caste: "GEN",
//     name: "Danish Shamshee",
//     email: "",
//     phone: "1234567890",
//     gender: "Male",
//     reservation: "",
//     aadharNumber: "123456789012",
//     fathersName: "",
//     mothersName: "",
//     DOB: "15-12-2004",
//     subMIC:["", ""],
//     subMDC:["", ""],
//     subAEC:["", ""],
//     subVAC:["", ""],
//     subSEC:["", ""]
//   }
// ]