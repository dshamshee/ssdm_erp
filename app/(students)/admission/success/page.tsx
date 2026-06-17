import { db } from "@/lib/db";
import { AdmittedStudentTable, batchTable, courseTable, academicSessionTable, subjectTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Link from "next/link";
import { CheckCircle2, ShieldAlert, ArrowLeft, Printer, FileText, ArrowRight } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  if (!studentId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
        <SiteHeader collegeName={config.name} />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Access Denied</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              No student ID parameter was detected. Please complete the registration and payment checklist.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter config={config} />
      </div>
    );
  }

  // Fetch admitted student and joining tables
  const student = await db
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
      
      courseName: courseTable.name,
      sessionName: academicSessionTable.name,
      
      mjcName: subjectTable.name,
      mjcCode: subjectTable.code,
    })
    .from(AdmittedStudentTable)
    .innerJoin(batchTable, eq(AdmittedStudentTable.batchId, batchTable.id))
    .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
    .innerJoin(academicSessionTable, eq(batchTable.academicSessionId, academicSessionTable.id))
    .innerJoin(subjectTable, eq(AdmittedStudentTable.subMJC, subjectTable.id))
    .where(eq(AdmittedStudentTable.id, studentId))
    .then((rows) => rows[0]);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
        <SiteHeader collegeName={config.name} />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Record Not Found</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              The database does not contain any completed admission logs for this student ID.
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow py-16">
        <div className="max-w-xl mx-auto px-4 space-y-8">
          
          {/* Card Wrapper */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-lg text-center space-y-6">
            
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Admission Confirmed!</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thank you, <strong>{student.name}</strong>. Your online admission forms and simulated checkout payment have been processed successfully.
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-400">College Roll No.</span>
                <span className="font-bold text-slate-800 font-mono">{student.collegeRoll}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-400">UAN Number</span>
                <span className="font-bold text-slate-800 font-mono">{student.UAN}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2">
                <span className="text-slate-400">Registered Course</span>
                <span className="font-bold text-slate-800">{student.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Major Subject (MJC)</span>
                <span className="font-bold text-slate-800">{student.mjcName}</span>
              </div>
            </div>

            {/* Buttons Stack */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              
              <a
                href={`/admission/print/application?studentId=${studentId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow shadow-blue-900/10 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Print Application Form
              </a>

              <button
                type="button"
                disabled
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center"
              >
                <FileText className="h-4 w-4" /> Print Payment Receipt (Coming Soon)
              </button>

            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-900 transition-colors"
              >
                Return to Homepage <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
