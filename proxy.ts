import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Admin-only route prefixes (route groups are transparent in the URL)
const adminRoutes = [
  "/college",
  "/department",
  "/course",
  "/subjects",
  "/academic-session",
  "/admission-open",
  "/fee-collection",
  "/tender",
];

// Student-only route prefixes
const studentRoutes = ["/student"];

// Public routes that never need auth
// (students) group: /admission/*, /examination
// (informative) group: /admission
const publicRoutes = [
  "/",
  "/auth",
  "/api/auth",
  // "/api/dev",
  "/api/upload",
  "/api/payments",
  "/auth/signin",
  "/admission",
  "/examination",
  "/payment-success",
  "/gallery",
  "/infrastructure",
  "/student-zone",
  "/miscellaneous-payment",
];

function isMatch(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes & static assets through
  if (
    isMatch(pathname, publicRoutes) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the full session (Next.js 16 proxy runs in Node.js runtime)
  const session = await auth.api.getSession({ headers: await headers() });

  // ── Unauthenticated → signin ──────────────────────────────────
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const role = session.user.role;

  // ── Admin routes: only superAdmin & admin allowed ─────────────
  if (isMatch(pathname, adminRoutes)) {
    if (role !== "superAdmin" && role !== "admin") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // ── Student routes: only student allowed ──────────────────────
  if (isMatch(pathname, studentRoutes)) {
    if (role === "superAdmin" || role === "admin") {
      return NextResponse.redirect(new URL("/college", request.url));
    }
  }

  // ── Root redirect based on role ───────────────────────────────
  if (pathname === "/") {
    if (role === "superAdmin" || role === "admin") {
      return NextResponse.redirect(new URL("/college", request.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except static files & images.
     * Next.js 16 proxy convention.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
