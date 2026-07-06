import { IconAlertCircle } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { fetchIncompleteProfile } from "./lib/action";
import { CompleteProfileForm } from "./_components/complete-profile-form";

export default async function CompleteProfilePage() {
  const result = await fetchIncompleteProfile();

  if (!result.success) {
    if (result.message === "Unauthorized") {
      redirect("/auth/signin");
    }

    // Profile already completed — redirect to dashboard
    if (result.message === "Profile is already completed") {
      redirect("/student/dashboard");
    }

    return (
      <ContentLayout title="Complete Profile">
        <div className="max-w-xl mx-auto mt-12 bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse dark:bg-rose-950 dark:text-rose-400">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Unable to Load Profile
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {result.message ||
                "Your profile data could not be loaded. Please try again or contact the administrator."}
            </p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Complete Your Profile">
      <div className="max-w-4xl mx-auto space-y-6 p-1 sm:p-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Complete Your Profile
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Fill in your personal and address details. This is a one-time
            action — please ensure all information is accurate.
          </p>
        </div>

        <CompleteProfileForm student={result.data} subjects={result.subjects || []} />
      </div>
    </ContentLayout>
  );
}
