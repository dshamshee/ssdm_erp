import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import { fetchPaymentInfo } from "./lib/action";
import { PaymentForm } from "./_components/payment-form";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  let paymentRes: any = { success: false, message: "No student ID provided" };
  if (studentId) {
    paymentRes = await fetchPaymentInfo(studentId);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {paymentRes.success && paymentRes.data ? (
            <>
              {/* Header Info */}
              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Admission Payment Checkout
                </h1>
                <p className="text-xs text-slate-500">
                  Secure online college fee payment portal
                </p>
              </div>

              <PaymentForm paymentData={paymentRes.data} />
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">
                Failed to Load Billing
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {paymentRes.message ||
                  "We could not fetch the student admission fee details. Please re-run the verification step."}
              </p>
              <div className="pt-2">
                <Link
                  href="/admission"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admission Portal
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
