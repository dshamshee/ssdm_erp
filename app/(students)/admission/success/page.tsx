import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import { db } from "@/lib/db";
import { AdmittedStudentTable, StudentFeePaymentTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Printer,
  FileText,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getSuccessDetails(studentId: string) {
  try {
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.id, studentId),
      with: { batch: { with: { course: true, academicSession: true } } },
    });

    const payment = await db.query.StudentFeePaymentTable.findFirst({
      where: eq(StudentFeePaymentTable.studentId, studentId),
      orderBy: [desc(StudentFeePaymentTable.createdAt)],
    });

    return { student, payment };
  } catch (error) {
    console.error("getSuccessDetails error:", error);
    return { student: null, payment: null };
  }
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  const { student, payment } = studentId
    ? await getSuccessDetails(studentId)
    : { student: null, payment: null };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow py-16 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 w-full">
          {student && payment ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-lg text-center space-y-6 animate-in fade-in duration-500">
              {/* Success Badge */}
              <div className="mx-auto w-fit p-3 bg-emerald-50 rounded-full text-emerald-600 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Admission Confirmed!
                </h1>
                <p className="text-xs text-slate-500">
                  Thank you, your payment has been processed successfully.
                </p>
              </div>

              {/* Admission Info summary */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left text-xs text-slate-700 divide-y divide-slate-200/60 space-y-3">
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400 font-semibold uppercase">
                    Student Name
                  </span>
                  <span className="font-bold text-slate-900">
                    {student.name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-semibold uppercase">
                    College Roll No
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {student.collegeRoll}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-semibold uppercase">
                    Course Stream
                  </span>
                  <span className="font-semibold">
                    {student.batch?.course?.name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 font-semibold uppercase">
                    Transaction ID
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {payment.transactionId}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-400 font-semibold uppercase">
                    Paid Amount
                  </span>
                  <span className="font-extrabold text-blue-900">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Print Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  href={`/admission/print/application?studentId=${student.id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4" /> Print Application Form
                </Link>
                <Link
                  href={`/admission/print/receipt?studentId=${student.id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow shadow-blue-900/10 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Fee Receipt
                </Link>
              </div>

              {/* Return to Home link */}
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to College
                  Homepage
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-md">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">
                Record Not Found
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                We could not locate the verification details or payment history
                for this student.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white shadow"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Return to Homepage
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
