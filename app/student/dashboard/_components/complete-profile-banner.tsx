import { IconAlertTriangle, IconArrowRight, IconUserEdit } from "@tabler/icons-react";
import Link from "next/link";
import type { DashboardStudent, DashboardBatch } from "../lib/types";

interface CompleteProfileBannerProps {
  student: DashboardStudent;
  batch: DashboardBatch | null;
}

export function CompleteProfileBanner({
  student,
  batch,
}: CompleteProfileBannerProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Welcome Mini Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Welcome, {student.name}!
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          {batch?.course?.name || "Your Course"} &mdash; Semester{" "}
          {student.currentSemesterCount}
        </p>
      </div>

      {/* Profile Completion Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 p-8 sm:p-10 shadow-xl dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 dark:border-amber-800/30">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-400 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="h-16 w-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <IconUserEdit className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-extrabold uppercase tracking-widest rounded-full">
              <IconAlertTriangle className="h-3.5 w-3.5" />
              Action Required
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Complete Your Profile
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Your account has been created with minimal details. Please complete
              your profile with accurate personal, academic, and contact
              information. This is a <strong>one-time action</strong> — once
              submitted, your profile will be locked for editing.
            </p>
          </div>

          <Link
            href="/student/complete-profile"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-black shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 hover:translate-y-[-1px] active:scale-[0.98] transition-all"
          >
            Complete Profile Now
            <IconArrowRight className="h-4.5 w-4.5" />
          </Link>

          <p className="text-[11px] text-muted-foreground">
            You will be able to access your dashboard, fee payments, and other
            services after completing your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
