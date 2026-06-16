import { db } from "@/lib/db";
import { AdmittedStudentTable, batchTable, courseTable, academicSessionTable, subjectTable, admissionOpenTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, CreditCard, ChevronRight, User, BookOpen, AlertCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;
  const batchId = resolvedParams.batch as string;
  
  if (!studentId || !batchId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
        <SiteHeader collegeName={config.name} />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Missing Information</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              No student ID or batch registration details were provided. Please re-run the verification step.
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
        </main>
        <SiteFooter config={config} />
      </div>
    );
  }

  // Fetch student, batch, course, session, and MJC details
  const studentData = await db
    .select({
      id: AdmittedStudentTable.id,
      name: AdmittedStudentTable.name,
      collegeRoll: AdmittedStudentTable.collegeRoll,
      UAN: AdmittedStudentTable.UAN,
      email: AdmittedStudentTable.email,
      phone: AdmittedStudentTable.phone,
      fathersName: AdmittedStudentTable.fathersName,
      mothersName: AdmittedStudentTable.mothersName,
      gender: AdmittedStudentTable.gender,
      DOB: AdmittedStudentTable.DOB,
      caste: AdmittedStudentTable.caste,
      religion: AdmittedStudentTable.religion,
      
      courseName: courseTable.name,
      courseCode: courseTable.code,
      sessionName: academicSessionTable.name,
      perSemesterFee: batchTable.perSemesterFee,
      
      mjcName: subjectTable.name,
      mjcCode: subjectTable.code,
      mjcPracticalFee: subjectTable.practicalFee,
      mjcHasPractical: subjectTable.hasPractical,
    })
    .from(AdmittedStudentTable)
    .innerJoin(batchTable, eq(AdmittedStudentTable.batchId, batchTable.id))
    .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
    .innerJoin(academicSessionTable, eq(batchTable.academicSessionId, academicSessionTable.id))
    .innerJoin(subjectTable, eq(AdmittedStudentTable.subMJC, subjectTable.id))
    .where(eq(AdmittedStudentTable.id, studentId))
    .then((rows) => rows[0]);

  if (!studentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
        <SiteHeader collegeName={config.name} />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Student Not Found</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We could not find any admitted student matching the provided registration.
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
        </main>
        <SiteFooter config={config} />
      </div>
    );
  }

  // Fetch admission open data to check if dates were extended
  const admissionOpen = await db.query.admissionOpenTable.findFirst({
    where: eq(admissionOpenTable.batchId, batchId),
  });

  const isExtended = admissionOpen?.isDateExtended ?? false;
  const lateFee = isExtended ? (admissionOpen?.lateFee ?? 0) : 0;
  
  // Calculate fees
  const hasPractical = studentData.mjcHasPractical;
  const practicalFee = hasPractical ? (studentData.mjcPracticalFee || 500) : 0;
  const perSemesterFee = studentData.perSemesterFee;
  const totalAmount = perSemesterFee + practicalFee + lateFee;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header Info */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-950 text-xs font-bold uppercase tracking-wider">
              Step 4: Admission Checkout
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
              Admissions Billing Summary
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please review your academic course selection and admission billing breakdown below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Student & Course Summary Card */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Applicant Details</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Verify your profile information</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Student Name</p>
                    <p className="font-bold text-slate-800 mt-0.5">{studentData.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Unique Roll Number</p>
                    <p className="font-bold text-slate-800 mt-0.5 font-mono">{studentData.collegeRoll}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Course Program</p>
                    <p className="font-bold text-slate-800 mt-0.5">{studentData.courseName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Session Year</p>
                    <p className="font-bold text-slate-800 mt-0.5">{studentData.sessionName}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-start gap-3 text-xs">
                  <BookOpen className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Major Subject (MJC)</p>
                    <p className="text-slate-500 mt-0.5">{studentData.mjcName} ({studentData.mjcCode})</p>
                  </div>
                </div>
              </div>

              {/* Notice card */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-xs text-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Simulated Billing Mode</p>
                  <p className="text-amber-700 leading-relaxed mt-0.5">
                    The payment gateway integration is currently in simulated staging mode. Clicking the button on the right will register the payment as successful and generate your downloadable admission form.
                  </p>
                </div>
              </div>
            </div>

            {/* Billing breakdown & pay button */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <CreditCard className="h-5 w-5 text-blue-900" />
                  <h3 className="font-bold text-slate-800 text-sm">Fee Breakdown</h3>
                </div>

                <div className="divide-y divide-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Semester Course Fee</span>
                    <span className="font-semibold">₹{perSemesterFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-400">Practical Fee</span>
                    <span className="font-semibold">{hasPractical ? `₹${practicalFee}` : "₹0 (No Practical)"}</span>
                  </div>
                  {lateFee > 0 && (
                    <div className="flex justify-between py-3 text-amber-700 font-medium">
                      <span className="text-amber-600">Late Fee (Extended Date)</span>
                      <span>₹{lateFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-4 text-slate-900 text-sm font-bold border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-blue-900">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/admission/success?studentId=${studentId}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow shadow-blue-900/10 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                >
                  Confirm & Simulate Payment <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
