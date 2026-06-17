import {
  IconAlertCircle,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconCreditCard,
  IconMail,
  IconPhone,
  IconPrinter,
  IconReceipt,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentLayout } from "@/components/content-layout";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { batchTable } from "@/lib/db/schema/department";
import {
  AdmittedStudentTable,
  StudentFeePaymentTable,
} from "@/lib/db/schema/student";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "student") {
    redirect("/auth/signin");
  }

  const email = session.user.email;

  // Find admitted student record matching authenticated email
  let student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.email, email),
  });

  // If not found and using student UAN email format, extract UAN and search
  if (!student && email.endsWith("@student.ssdm.local")) {
    const uan = email.split("@")[0].toUpperCase();
    student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.UAN, uan),
    });
  }

  // If no student profile exists in AdmittedStudentTable
  if (!student) {
    return (
      <ContentLayout title="Dashboard">
        <div className="max-w-xl mx-auto mt-12 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <IconAlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Admitted Profile Not Found
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Your login credentials are not currently linked with any active
              student record in the database. Please verify your admission
              registration status with the college administrator.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-50 flex flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Authenticated Email
            </span>
            <span className="px-4 py-1.5 bg-slate-50 rounded-full font-mono text-xs font-bold text-slate-600 border border-slate-150">
              {email}
            </span>
          </div>
        </div>
      </ContentLayout>
    );
  }

  // Fetch batch details
  const batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.id, student.batchId),
    with: { course: true, academicSession: true },
  });

  // Look up fee payment status for studentId and currentSemesterCount
  const payment = await db.query.StudentFeePaymentTable.findFirst({
    where: and(
      eq(StudentFeePaymentTable.studentId, student.id),
      eq(StudentFeePaymentTable.semesterCount, student.currentSemesterCount),
      eq(StudentFeePaymentTable.status, "Success"),
    ),
  });

  const hasPaid = !!payment;

  return (
    <ContentLayout title="Student Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 p-1 sm:p-4">
        {/* Welcome Premium Gradient Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-8 sm:p-10 shadow-2xl border border-indigo-950">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-300 via-blue-900 to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-semibold text-indigo-200">
                <IconSchool className="h-3.5 w-3.5" />
                Active Admission Profile
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-100">
                Welcome back, {student.name}!
              </h1>
              <p className="text-slate-300 text-sm max-w-lg font-medium">
                Keep track of your course progress, manage tuition and exam
                fees, and print official college receipts from your portal.
              </p>
            </div>

            {/* Quick Profile Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl md:min-w-[320px] text-xs font-medium">
              <div>
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  College Roll
                </span>
                <span className="font-mono text-white text-sm font-bold mt-0.5 block">
                  {student.collegeRoll}
                </span>
              </div>
              <div>
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  UAN Reference
                </span>
                <span className="font-mono text-white text-sm font-bold mt-0.5 block">
                  {student.UAN}
                </span>
              </div>
              <div className="col-span-2 border-t border-white/10 pt-2.5 mt-1">
                <span className="text-indigo-200/70 block uppercase tracking-wider text-[9px] font-bold">
                  Current Course & Batch
                </span>
                <span className="text-slate-100 font-semibold mt-0.5 block truncate">
                  {batch?.course?.name || "B.A./B.Sc./B.Com"} (
                  {batch?.academicSession?.name || "N/A"})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Academic & Contact Details */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <IconUser className="h-5 w-5 text-indigo-600" />
                Academic Profile
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <IconSchool className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Current Semester
                    </span>
                    <span className="text-slate-800 font-extrabold text-sm mt-0.5 block">
                      Semester {student.currentSemesterCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <IconCalendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Academic Session
                    </span>
                    <span className="text-slate-700 font-bold text-sm mt-0.5 block">
                      {batch?.academicSession?.name || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <IconMail className="h-4.5 w-4.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Personal Email
                    </span>
                    <span className="text-slate-700 font-semibold text-sm mt-0.5 block truncate">
                      {student.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <IconPhone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                      Mobile Number
                    </span>
                    <span className="text-slate-700 font-semibold text-sm mt-0.5 block">
                      {student.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fee Status & Actions */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <IconCreditCard className="h-5 w-5 text-indigo-600" />
                    Semester Tuition & Registration Fee
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold">
                    Manage payment details for Semester{" "}
                    {student.currentSemesterCount}
                  </p>
                </div>
                <div>
                  {hasPaid ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                      <IconCheck className="h-3.5 w-3.5" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                      <IconAlertCircle className="h-3.5 w-3.5" />
                      Pending Payment
                    </span>
                  )}
                </div>
              </div>

              {hasPaid && payment ? (
                /* Paid state rendering */
                <div className="space-y-6">
                  <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                        Amount Authenticated
                      </span>
                      <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                        Payment Mode
                      </span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {payment.paymentMode}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">
                        Transaction ID
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block truncate">
                        {payment.transactionId}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-emerald-50/30 border border-emerald-100/50 p-5 rounded-2xl">
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
                      <IconReceipt className="h-5 w-5" />
                    </div>
                    <div className="text-center sm:text-left space-y-0.5 flex-grow">
                      <h4 className="text-xs font-extrabold text-slate-800">
                        Payment Receipt & Application Receipt Ready
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Your transaction was processed successfully. You can now
                        download and print your official college payment receipt
                        and admission form application.
                      </p>
                    </div>
                    <Link
                      href={`/payment-success?paymentId=${payment.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all"
                    >
                      <IconPrinter className="h-4 w-4" />
                      Print Receipt
                    </Link>
                  </div>
                </div>
              ) : (
                /* Unpaid state rendering */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/40 border border-amber-100 p-5 rounded-2xl">
                    <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center shrink-0">
                      <IconAlertCircle className="h-5 w-5" />
                    </div>
                    <div className="text-center sm:text-left space-y-0.5 flex-grow">
                      <h4 className="text-xs font-extrabold text-slate-800">
                        Tuition Fees Pending for Semester{" "}
                        {student.currentSemesterCount}
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        You have not completed the fee payment registration for
                        your current academic semester. Please clear the
                        outstanding tuition and registration fee balance to
                        retain access to classes and examinations.
                      </p>
                    </div>
                    <Link
                      href={`/admission/payment?studentId=${student.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 hover:translate-x-0.5 active:scale-[0.98] transition-all"
                    >
                      Pay Semester Fee
                      <IconArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
