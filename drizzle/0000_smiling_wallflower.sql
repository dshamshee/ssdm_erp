CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academic_session_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "batch" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"courseSessionId" varchar(128) NOT NULL,
	"name" varchar(30) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_session" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"courseId" varchar(128) NOT NULL,
	"sessionId" varchar(128) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(10) NOT NULL,
	"type" varchar(30) DEFAULT 'UG Regular' NOT NULL,
	"description" varchar(255) NOT NULL,
	"departmentId" varchar(128) NOT NULL,
	"duration" integer DEFAULT 4 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_name_unique" UNIQUE("name"),
	CONSTRAINT "course_code_unique" UNIQUE("code"),
	CONSTRAINT "duration_check" CHECK ("course"."duration" BETWEEN 2 AND 8),
	CONSTRAINT "type_check" CHECK ("course"."type" IN ('UG Regular', 'UG Part Time', 'UG Vocational', 'PG Regular', 'PG Part Time', 'PG Vocational'))
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(30) NOT NULL,
	"description" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_code_unique" UNIQUE("code"),
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fee" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"semesterId" varchar(128) NOT NULL,
	"institution" integer DEFAULT 0 NOT NULL,
	"university" integer DEFAULT 0 NOT NULL,
	"late" integer DEFAULT 0 NOT NULL,
	"practical" integer DEFAULT 0 NOT NULL,
	"cultural" integer DEFAULT 0 NOT NULL,
	"sports" integer DEFAULT 0 NOT NULL,
	"miscellaneous" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semester_subject" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"semesterId" varchar(128) NOT NULL,
	"subjectId" varchar(128) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "semester" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"courseSessionId" varchar(128) NOT NULL,
	"name" varchar(30) NOT NULL,
	"semesterNumber" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"type" varchar(30) DEFAULT 'MJC' NOT NULL,
	"isActive" boolean DEFAULT true,
	"hasPractical" boolean DEFAULT false NOT NULL,
	"practicalFee" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subject_code_unique" UNIQUE("code"),
	CONSTRAINT "type_check" CHECK ("subject"."type" IN ('MJC', 'MIC', 'MDC', 'SEC', 'VAC'))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_courseSessionId_course_session_id_fk" FOREIGN KEY ("courseSessionId") REFERENCES "public"."course_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_session" ADD CONSTRAINT "course_session_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_session" ADD CONSTRAINT "course_session_sessionId_academic_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."academic_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_departmentId_department_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee" ADD CONSTRAINT "fee_semesterId_semester_id_fk" FOREIGN KEY ("semesterId") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semester_subject" ADD CONSTRAINT "semester_subject_semesterId_semester_id_fk" FOREIGN KEY ("semesterId") REFERENCES "public"."semester"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semester_subject" ADD CONSTRAINT "semester_subject_subjectId_subject_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semester" ADD CONSTRAINT "semester_courseSessionId_course_session_id_fk" FOREIGN KEY ("courseSessionId") REFERENCES "public"."course_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");