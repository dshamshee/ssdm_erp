import { IconAlertCircle } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { fetchDashboardData } from "./query/fetch-dashboard-data";
import { checkPendingFee } from "./query/check-pending-fee";
import { DashboardBanner } from "./_components/dashboard-banner";
import { CongratulationsCard } from "./_components/congratulations-card";
import { AcademicProfileGrid } from "./_components/academic-profile-grid";
import { CompleteProfileBanner } from "./_components/complete-profile-banner";
import { FeePaymentPopup } from "./_components/fee-payment-popup";

export default async function StudentDashboardPage() {
  const result = await fetchDashboardData();

  if (!result.success) {
    if (result.message === "Unauthorized") {
      redirect("/auth/signin");
    }

    // Render profile not found error state
    return (
      <ContentLayout title="Dashboard">
        <div className="max-w-xl mx-auto mt-12 bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse dark:bg-rose-950 dark:text-rose-450">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Admitted Profile Not Found
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Your login credentials are not currently linked with any active
              student record in the database. Please verify your admission
              registration status with the college administrator.
            </p>
          </div>
          <div className="pt-4 border-t border-border flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Authenticated Email
            </span>
            <span className="px-4 py-1.5 bg-muted rounded-full font-mono text-xs font-bold text-foreground border border-border">
              {result.email}
            </span>
          </div>
        </div>
      </ContentLayout>
    );
  }

  const { student, batch } = result.data!;

  // If profile is incomplete, show the completion banner instead of the full dashboard
  if (!student.isProfileCompleted) {
    return (
      <ContentLayout title="Complete Your Profile">
        <div className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
          <CompleteProfileBanner student={student} batch={batch} />
        </div>
      </ContentLayout>
    );
  }

  // Check if the student has any pending fee for their current semester
  const feeStatus = await checkPendingFee(
    student.id,
    student.currentSemesterCount,
    student.batchId,
    student.isPassed,
  );

  return (
    <ContentLayout title="Student Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
        {/* Fee Payment Popup — auto-opens when fees are pending */}
        {feeStatus.hasPendingFee && (
          <FeePaymentPopup
            studentName={student.name}
            studentId={student.id}
            semesterCount={student.currentSemesterCount}
            isAdmissionOpen={feeStatus.isAdmissionOpen}
          />
        )}

        {/* Welcome Premium Gradient Banner */}
        <DashboardBanner student={student} batch={batch} />

        {/* Passed & Completed Course Congratulations Card */}
        <CongratulationsCard student={student} batch={batch} />

        {/* Academic Profile Details Full-width Grid */}
        <AcademicProfileGrid student={student} batch={batch} />
      </div>
    </ContentLayout>
  );
}

