# SSDM ERP — College Enterprise Resource Planning System

A full-stack **Enterprise Resource Planning (ERP)** web application built for **Sant Sandhya Das Mahila College** to digitise and streamline academic administration, student admissions, fee collection, document management, and public-facing informational pages.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
  - [Public-Facing Website](#public-facing-website)
  - [Admin Panel](#admin-panel)
  - [Student Portal](#student-portal)
  - [Admission Workflow](#admission-workflow)
  - [Payment Integration](#payment-integration)
  - [File Upload & Document Management](#file-upload--document-management)
- [Database Schema](#database-schema)
- [Authentication & Authorisation](#authentication--authorisation)
- [Third-Party Integrations](#third-party-integrations)
- [State Management](#state-management)
- [Build & Development](#build--development)
- [Database Management](#database-management)
- [Code Quality & Linting](#code-quality--linting)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SSDM ERP serves as the backbone for managing day-to-day college operations. It provides:

- A **public-facing website** with admissions, notices, tenders, gallery, and infrastructure information.
- An **admin dashboard** for managing departments, courses, subjects, academic sessions, batches, and student records.
- A **student portal** with a personal dashboard, profile management, fee history, certificates, and schedule views.
- **Online fee payment** via an integrated payment gateway with encrypted transaction handling.
- **Cloud-based document management** for student registrations and academic records.

---

## Tech Stack

| Layer             | Technology                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/) (App Router, React Server Components)     |
| **Language**      | [TypeScript 5](https://www.typescriptlang.org/)                             |
| **UI Library**    | [React 19](https://react.dev/)                                              |
| **Styling**       | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix Vega preset) |
| **Database**      | [PostgreSQL](https://www.postgresql.org/)                                   |
| **ORM**           | [Drizzle ORM](https://orm.drizzle.team/) with `node-postgres` driver        |
| **Authentication**| [Better Auth](https://www.better-auth.com/) (email/password, role-based)    |
| **State Mgmt**    | [Zustand](https://zustand.docs.pmnd.rs/) + [Immer](https://immerjs.github.io/immer/) |
| **Data Fetching** | [TanStack React Query v5](https://tanstack.com/query)                       |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **Icons**         | [Tabler Icons](https://tabler.io/icons) + [Lucide React](https://lucide.dev/) |
| **File Uploads**  | [Cloudinary](https://cloudinary.com/) (image & PDF)                         |
| **Payments**      | GetEPay Payment Gateway (AES-256-GCM / AES-256-CBC encrypted)              |
| **Linter**        | [Biome 2.2](https://biomejs.dev/)                                           |
| **Package Mgmt**  | npm / [Bun](https://bun.sh/) (used for seed scripts)                       |
| **Fonts**         | Google Fonts — Inter                                                        |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev/) (toast notifications)              |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  React 19 · Tailwind CSS 4 · shadcn/ui · Zustand · React Query  │
└──────────────┬──────────────────────────────────────┬────────────┘
               │                                      │
               ▼                                      ▼
┌──────────────────────┐               ┌──────────────────────────┐
│   Next.js App Router │               │     API Routes           │
│   (Server Components │               │  /api/auth/*             │
│    + Server Actions) │               │  /api/payments/*         │
│                      │               │  /api/upload             │
└──────────┬───────────┘               └──────────┬───────────────┘
           │                                      │
           ▼                                      ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Drizzle ORM (node-postgres)                    │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    PostgreSQL DB     │
                    └─────────────────────┘

External Services:
  • Cloudinary  — File/image/PDF uploads
  • GetEPay     — Payment gateway (encrypted callback & redirect)
  • Better Auth — Session & account management
```

### Key Architectural Decisions

- **React Server Components (RSC)** — Data fetching happens server-side, minimising client bundle size and eliminating redundant API calls.
- **Next.js 16 Proxy** — Route-level authentication and RBAC enforced via `proxy.ts` (successor to middleware in Next.js 16).
- **Server Actions** — Mutations (create, update, delete) are implemented as Next.js Server Actions (`"use server"`) instead of REST endpoints.
- **Drizzle ORM** — Type-safe, SQL-first ORM with relational queries and schema-driven migrations.
- **Co-located Feature Modules** — Each route segment co-locates its `_components/`, `lib/`, and `query/` directories, following a feature-based folder structure.

---

## Project Structure

```
ssdm_erp/
├── app/                          # Next.js App Router
│   ├── (departments)/            # Admin route group
│   │   ├── academic-session/     #   Academic session CRUD
│   │   ├── admission-open/       #   Admission open management
│   │   ├── college/              #   College overview
│   │   ├── course/               #   Course management
│   │   ├── department/           #   Department management
│   │   ├── notice/               #   Notice board management
│   │   ├── promote-students/     #   Student semester promotions
│   │   ├── semester-admission-open/ # Semester admission control
│   │   ├── student-records/      #   Admitted student records
│   │   ├── subjects/             #   Subject management
│   │   ├── tender/               #   Tender document management
│   │   └── verify/               #   Payment verification
│   ├── (students)/               # Public student route group
│   │   ├── admission/            #   Multi-step admission flow
│   │   │   ├── register/         #     Student registration form
│   │   │   ├── verify/           #     OTP / data verification
│   │   │   ├── payment/          #     Fee payment initiation
│   │   │   ├── print/            #     Admission slip print
│   │   │   └── success/          #     Admission success page
│   │   └── examination/          #   Examination portal (planned)
│   ├── (informative)/            # Public informational pages
│   │   ├── admission/            #   Admission info
│   │   ├── examination/          #   Exam info
│   │   ├── gallery/              #   Photo gallery
│   │   ├── infrastructure/       #   Infrastructure details
│   │   └── student-zone/         #   Student resources
│   ├── api/                      # API routes
│   │   ├── auth/                 #   Better Auth handler
│   │   ├── dev/                  #   Developer utilities
│   │   ├── payments/             #   Payment gateway endpoints
│   │   │   ├── callback/         #     Server-to-server callback
│   │   │   └── redirect/         #     Browser redirect handler
│   │   └── upload/               #   Cloudinary file upload
│   ├── auth/signin/              # Sign-in page
│   ├── payment-success/          # Payment result page
│   ├── student/                  # Authenticated student portal
│   │   ├── dashboard/            #   Student dashboard
│   │   ├── profile/              #   Profile management
│   │   ├── fee-history/          #   Fee payment records
│   │   ├── certificates/         #   Certificate requests
│   │   └── schedule/             #   Academic schedule
│   ├── page.tsx                  # Landing page (public)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles & CSS variables
├── components/                   # Shared UI components
│   ├── ui/                       #   shadcn/ui primitives (30+ components)
│   ├── informative/              #   Public site components
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── notice-board.tsx
│   │   └── academics-section.tsx
│   ├── admin-panel-layout.tsx    #   Admin sidebar layout
│   ├── sidebar.tsx               #   Collapsible sidebar
│   ├── menu.tsx                  #   Dynamic menu renderer
│   ├── navbar.tsx                #   Top navbar
│   ├── user-nav.tsx              #   User profile dropdown
│   └── ...                       #   Other shared components
├── lib/                          # Core utilities & configuration
│   ├── db/
│   │   ├── index.ts              #   Database connection (Drizzle)
│   │   ├── schema/               #   Database schema definitions
│   │   │   ├── auth-schema.ts    #     Auth tables (user, session, account, verification)
│   │   │   ├── department.ts     #     Academic tables (departments, courses, subjects, batches, etc.)
│   │   │   └── student.ts        #     Student tables (enrolled, admitted, documents, fees, remarks)
│   │   └── seed/                 #   Seed scripts
│   │       ├── seed.ts           #     Main seed runner
│   │       ├── create-admin.ts   #     Admin user creation
│   │       ├── create-student.ts #     Student user creation
│   │       └── ...               #     Other seed utilities
│   ├── auth.ts                   #   Better Auth server config
│   ├── auth-client.ts            #   Better Auth client config
│   ├── auth-role.ts              #   Role definitions (superAdmin, admin, student)
│   ├── college-config.ts         #   College info from environment
│   ├── getepay-encrypt.ts        #   Payment gateway encryption (AES-256)
│   ├── menu-list.ts              #   Admin sidebar menu config
│   ├── student-menu-list.ts      #   Student sidebar menu config
│   ├── get-query-client.ts       #   TanStack Query client factory
│   └── utils.ts                  #   General utility functions
├── hooks/                        # Custom React hooks
│   ├── use-sidebar.ts            #   Sidebar state (Zustand + persist)
│   └── use-store.ts              #   Hydration-safe store hook
├── actions/                      # Server Actions
│   └── department.ts             #   Department-related server actions
├── types/                        # TypeScript type definitions
│   └── return.ts                 #   Standardised API return type
├── drizzle/                      # Database migrations
│   ├── 0000_*.sql                #   Initial schema migration
│   ├── 0001_*.sql                #   Migration: additional columns
│   ├── 0002_*.sql                #   Migration: student table updates
│   └── meta/                     #   Migration metadata
├── proxy.ts                      # Next.js 16 proxy (auth + RBAC guard)
├── drizzle.config.ts             # Drizzle Kit configuration
├── biome.json                    # Biome linter/formatter config
├── components.json               # shadcn/ui configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS (Tailwind plugin)
├── next.config.ts                # Next.js configuration
└── package.json                  # Dependencies & scripts
```

---

## Features

### Public-Facing Website

- **Landing Page** — Hero section, college overview, statistics, facilities showcase, testimonials, and contact information.
- **Open Admissions** — Dynamically lists currently open admissions with course details, session, and deadlines.
- **Notice Board** — Active notices with support for PDF attachments.
- **Tenders** — Published tender documents with start/end dates.
- **Gallery** — Campus photo gallery.
- **Infrastructure** — College infrastructure showcase.
- **Student Zone** — Student resources and information hub.

### Admin Panel

- **Academic Setup** — Full CRUD for:
  - Colleges
  - Departments (code, name, description)
  - Courses (linked to departments, duration, type: UG/PG Regular/Vocational)
  - Subjects (code, name, category: Science/Commerce/Arts/General, practical flag)
  - Academic Sessions (name, start/end dates)
  - Batches (course + session combination, per-semester fee)
- **Admission Management** — Control admission open/close windows with late fees, practical fees, and date extensions.
- **Semester Admissions** — Manage semester-wise admission windows per academic session.
- **Student Records** — View, search, and manage admitted students with advanced filtering and data tables (TanStack Table).
- **Student Promotion** — Bulk promote students across semesters.
- **Payment Verification** — Admin dashboard for verifying student fee payments.
- **Notices & Tenders** — Create, edit, and manage notices and tender documents with PDF support.
- **Collapsible Sidebar** — Persistent sidebar with hover-open functionality, grouped menu sections.

### Student Portal

- **Dashboard** — Personalised overview of academic status, current semester, and key metrics.
- **Profile Management** — View and update personal details, academic records, and documents.
- **Fee History** — Complete fee payment history with transaction details and status tracking.
- **Certificates** — Request and track academic certificates.
- **Schedule** — View academic schedule and important dates.

### Admission Workflow

A multi-step admission process for new students:

1. **Registration** — Student fills in personal, academic, and subject selection details.
2. **Verification** — Data verification step before payment.
3. **Payment** — Online fee payment via GetEPay payment gateway.
4. **Success** — Confirmation page after successful payment.
5. **Print** — Printable admission slip generation.

### Payment Integration

- **Gateway**: GetEPay Payment Gateway
- **Encryption**: Dual-mode encryption support:
  - **Sandbox/UAT**: AES-256-GCM with PBKDF2-derived keys (SHA-512)
  - **Production**: AES-256-CBC with Base64-encoded or MD5-hashed IVs
- **Flow**:
  1. Payment initiated client-side → encrypted payload sent to GetEPay.
  2. **Callback** (`/api/payments/callback`) — Server-to-server POST from GetEPay, decrypts response, validates merchant ID and amount, updates payment status in DB.
  3. **Redirect** (`/api/payments/redirect`) — Browser redirect from GetEPay, processes return and redirects to success/failure page.
- **Security**: Merchant ID validation, amount mismatch detection, encrypted payloads.

### File Upload & Document Management

- **Provider**: Cloudinary (cloud-based media management)
- **Supported formats**: Images (auto-optimised to WebP/AVIF) and PDFs
- **Optimisations**: Auto-resize (max 1200×1200), quality compression (`auto:eco`), format auto-conversion
- **Use cases**: Student registration documents (Aadhaar, caste certificate, marksheets, photos, signatures, etc.)

---

## Database Schema

The application uses PostgreSQL managed through Drizzle ORM with three schema domains:

### Authentication Tables

| Table          | Purpose                                      |
| -------------- | -------------------------------------------- |
| `user`         | User accounts with role-based access         |
| `session`      | Active user sessions                         |
| `account`      | OAuth/credential accounts linked to users    |
| `verification` | Email/token verification records             |

### Academic Tables

| Table                      | Purpose                                          |
| -------------------------- | ------------------------------------------------ |
| `department`               | College departments (code, name)                 |
| `course`                   | Courses under departments (UG/PG types)          |
| `subject`                  | Subjects with category and practical flags       |
| `academic_session`         | Academic year sessions                           |
| `batch`                    | Course + session combination with fee info       |
| `admission_open`           | Admission windows per batch                      |
| `semester_admission_open`  | Semester-wise admission windows                  |
| `tender`                   | Published tenders with documents                 |
| `notice`                   | College notices with optional file attachments   |

### Student Tables

| Table                                | Purpose                                          |
| ------------------------------------ | ------------------------------------------------ |
| `enrolled_students`                  | Pre-admission enrolled student records           |
| `admitted_students`                  | Fully admitted students with complete profiles   |
| `student_previous_academic_record`   | Prior academic history (HS/UG records)           |
| `student_documents`                  | Uploaded documents (Aadhaar, certificates, etc.) |
| `student_fee_payment`                | Fee payment transactions with status tracking    |
| `student_remark`                     | Admin remarks on students (Academic/Discipline)  |

### Key Schema Features

- **CUID2 primary keys** — Collision-resistant, URL-safe unique identifiers.
- **Check constraints** — Database-level validation for enums (gender, caste, admission type, course type, remark importance, etc.).
- **Cascading deletes** — Referential integrity maintained across related tables.
- **JSONB fields** — Flexible subject arrays (MIC, MDC, AEC, SEC, VAC) stored as JSONB.
- **Relational queries** — Full Drizzle relations defined for all table associations.

### Entity Relationship Overview

```
Department ──1:M──▶ Course ──1:M──▶ Batch ──1:M──▶ AdmissionOpen
                                     │
                     AcademicSession ─┘
                                     │
                                     ▼
                              AdmittedStudent ──1:1──▶ PreviousAcademicRecord
                                     │         ──1:1──▶ StudentDocuments
                                     │         ──1:M──▶ StudentFeePayment
                                     │         ──1:M──▶ StudentRemark
                                     ▼
                              EnrolledStudent
```

---

## Authentication & Authorisation

### Auth Provider

- **Better Auth** — Lightweight, framework-agnostic auth library with first-class Drizzle ORM adapter.
- **Strategy**: Email + Password (auto sign-in disabled for manual control).

### Role-Based Access Control (RBAC)

Three user roles defined in the system:

| Role         | Access Level                                                      |
| ------------ | ----------------------------------------------------------------- |
| `superAdmin` | Full system access — all admin routes and operations              |
| `admin`      | Administrative access — department management and student records |
| `student`    | Student portal only — dashboard, profile, fee history, etc.       |

### Route Protection

Route protection is enforced via **Next.js 16 Proxy** (`proxy.ts`):

- **Admin routes** (`/college`, `/department`, `/course`, `/subjects`, `/academic-session`, `/admission-open`, `/tender`) — restricted to `superAdmin` and `admin` roles.
- **Student routes** (`/student/*`) — restricted to `student` role.
- **Public routes** (`/`, `/auth/*`, `/admission/*`, `/examination/*`, `/gallery`, `/infrastructure`, `/student-zone`, `/api/auth/*`, `/api/payments/*`, `/api/upload`) — accessible without authentication.
- **Unauthenticated users** — redirected to `/auth/signin`.
- **Role mismatch** — admins trying to access student routes are redirected to `/college`; students trying admin routes are redirected to `/student/dashboard`.

---

## Third-Party Integrations

| Service         | Purpose                                  | Integration Point           |
| --------------- | ---------------------------------------- | --------------------------- |
| **Cloudinary**  | Cloud media storage and image transforms | `/api/upload` route         |
| **GetEPay**     | Online payment processing                | `/api/payments/*` routes    |
| **Better Auth** | Authentication & session management      | `/api/auth/*` routes        |
| **Google Fonts**| Typography (Inter font family)           | Next.js font optimisation   |

---

## State Management

The application uses a layered state management approach:

| Layer                  | Tool                     | Usage                                              |
| ---------------------- | ------------------------ | -------------------------------------------------- |
| **Server State**       | TanStack React Query v5  | Data fetching, caching, optimistic updates          |
| **Client State**       | Zustand + Immer          | Sidebar toggle, UI preferences                     |
| **Form State**         | React Hook Form + Zod    | Form validation with schema-based type inference   |
| **Persistence**        | Zustand persist          | Sidebar state saved to `localStorage`              |
| **Hydration Safety**   | Custom `useStore` hook   | Prevents hydration mismatch for persisted stores   |

### Query Client Configuration

- Server-side: Fresh `QueryClient` per request.
- Client-side: Singleton `QueryClient` with 60-second stale time.
- Pending queries included in dehydration for streaming SSR.

---

## Build & Development

### Prerequisites

- **Node.js** ≥ 18
- **Bun** (used for running seed scripts)
- **PostgreSQL** database instance

### Available Scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start development server                      |
| `npm run build`        | Create production build                       |
| `npm run start`        | Start production server                       |
| `npm run lint`         | Run Biome linter                              |
| `npm run format`       | Auto-format code with Biome                   |
| `npm run db:push`      | Push schema changes to database               |
| `npm run db:generate`  | Generate SQL migration files                  |
| `npm run db:migrate`   | Run pending migrations                        |
| `npm run db:seed`      | Seed database with initial data               |
| `npm run db:create-admin` | Create an admin user                       |
| `npm run db:create-student` | Create a student user                    |
| `npm run db:studio`    | Open Drizzle Studio (database GUI)            |

### Getting Started

```bash
# 1. Clone the repository
git clone <repository-url>
cd ssdm_erp

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy the example .env and fill in your values
cp .env.example .env

# 4. Push database schema
npm run db:push

# 5. Seed the database (optional)
npm run db:seed

# 6. Create an admin user
npm run db:create-admin

# 7. Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Database Management

### Migrations

Drizzle Kit manages database migrations:

```bash
# Generate a new migration after schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (development only)
npm run db:push

# Open Drizzle Studio for visual database management
npm run db:studio
```

### Seed Data

Seed scripts are located in `lib/db/seed/` and run via Bun:

- `seed.ts` — Main seed runner (departments, courses, subjects, sessions, batches).
- `create-admin.ts` — Creates admin user accounts.
- `create-student.ts` — Creates student user accounts with realistic fake data.
- `seed-admitted-students.ts` — Seeds admitted student records.
- `department.ts` — Seeds department and course data.
- `student.ts` — Seeds student registration data.
- `migrate-college-roll.ts` — Utility for migrating college roll number formats.

---

## Code Quality & Linting

### Biome 2.2

The project uses **Biome** as its unified linter and formatter:

- **Formatter**: 2-space indentation, double quotes, compact expansion.
- **Linter Rules**:
  - Recommended rule set enabled.
  - `noUnusedVariables` — error level.
  - `useBlockStatements` — enforced with safe auto-fix.
  - Next.js and React domain rules enabled.
  - Unknown CSS at-rules suppressed (for Tailwind CSS compatibility).
- **Import Organisation**: Auto-sorted on save.

### TypeScript

- **Target**: ES2017
- **Strict mode** enabled.
- **Bundler module resolution** for Next.js compatibility.
- **Path aliases**: `@/*` maps to project root.

---

## Environment Configuration

The application requires the following environment variables. Create a `.env` file in the project root:

| Variable                    | Description                              |
| --------------------------- | ---------------------------------------- |
| `DATABASE_URL`              | PostgreSQL connection string             |
| `BETTER_AUTH_URL`           | Base URL for Better Auth                 |
| `BETTER_AUTH_SECRET`        | Secret key for Better Auth sessions      |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`       | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`    | Cloudinary API secret                    |
| `GETEPAY_URL`              | GetEPay gateway URL                      |
| `GETEPAY_MID`              | GetEPay merchant ID                      |
| `GETEPAY_KEY`              | GetEPay encryption key                   |
| `GETEPAY_IV`               | GetEPay encryption IV                    |
| `CRYPTO_CODE`              | PBKDF2 iteration count for encryption    |
| `NEXT_PUBLIC_APP_URL`      | Public application URL                   |
| `COLLEGE_NAME`             | College name (configurable)              |
| `COLLEGE_ADDRESS`          | College address                          |
| `COLLEGE_CITY`             | College city                             |
| `COLLEGE_STATE`            | College state                            |
| `COLLEGE_PINCODE`          | College PIN code                         |
| `COLLEGE_EMAIL`            | College contact email                    |
| `COLLEGE_PHONE`            | College contact phone                    |

> **Note:** Never commit the `.env` file to version control. It is already included in `.gitignore`.

---

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

### Key Considerations

- Ensure PostgreSQL is accessible from the production environment.
- Set `NODE_ENV=production` for production deployments.
- The payment gateway automatically switches between GCM (sandbox) and CBC (production) encryption modes based on the environment and gateway URL.
- Cloudinary credentials must be configured for file upload functionality.
- The `proxy.ts` file handles all route-level authentication in Next.js 16 (replaces traditional middleware).

---

## Contributing

1. Create a feature branch from `main`.
2. Follow the existing code patterns and file structure conventions.
3. Run `npm run lint` and `npm run format` before committing.
4. Ensure all database schema changes include a generated migration (`npm run db:generate`).
5. Test both admin and student role flows.

---

## License

This project is proprietary software developed for Sant Sandhya Das Mahila College. All rights reserved.
