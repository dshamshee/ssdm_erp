import { getStudentPaymentDetails } from "./lib/action";
import { PaymentContainer } from "./_components/payment-container";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const uan = resolvedParams.uan as string | undefined;
  const studentId = resolvedParams.studentId as string | undefined;
  const errorParam = resolvedParams.error as string | undefined;

  const config = getCollegeConfig();

  // Fetch student and fee details
  const res = await getStudentPaymentDetails({ uan, studentId });

  let initialError: string | null = null;
  if (errorParam === "payment_failed") {
    initialError = "The transaction request was rejected or failed at the secure payment gateway. Please retry or try another payment method.";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100/50">
        <div className="max-w-3xl mx-auto">
          {res.success && res.student ? (
            <PaymentContainer
              student={res.student}
              isAlreadyPaid={res.isAlreadyPaid || false}
              payment={res.payment || null}
              fees={res.fees || null}
              pendingPayment={res.pendingPayment || null}
              initialError={initialError}
            />
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-4 max-w-md mx-auto">
              <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Invalid Payment Session
              </h2>
              <p className="text-sm text-slate-500">
                {res.message ||
                  "We could not retrieve your admission profile details. Please verify your UAN and major course again to access the payment screen."}
              </p>
              <a
                href="/admission"
                className="inline-block mt-4 px-6 py-2 bg-blue-900 text-white rounded-full text-sm font-semibold hover:bg-blue-800 transition"
              >
                Go to Verification
              </a>
            </div>
          )}
        </div>
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
