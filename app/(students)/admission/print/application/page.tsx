import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import {
  AdmittedStudentTable,
  StudentPreviousAcademicRecordTable,
  subjectTable,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { ShieldAlert, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PrintTrigger } from "../_components/print-trigger";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getApplicationDetails(studentId: string) {
  try {
    const student = await db.query.AdmittedStudentTable.findFirst({
      where: eq(AdmittedStudentTable.id, studentId),
      with: { batch: { with: { course: true, academicSession: true } } },
    });

    if (!student)
      return { student: null, academic: null, subjectMap: new Map() };

    const academic =
      await db.query.StudentPreviousAcademicRecordTable.findFirst({
        where: eq(StudentPreviousAcademicRecordTable.studentId, studentId),
      });

    const subjectIds = [
      student.subMJC,
      ...(student.subMIC || []),
      ...(student.subMDC || []),
      ...(student.subAEC || []),
      ...(student.subSEC || []),
      ...(student.subVAC || []),
    ].filter(Boolean);

    let subjects: any[] = [];
    if (subjectIds.length > 0) {
      subjects = await db
        .select()
        .from(subjectTable)
        .where(inArray(subjectTable.id, subjectIds));
    }

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    return { student, academic, subjectMap };
  } catch (error) {
    console.error("getApplicationDetails error:", error);
    return { student: null, academic: null, subjectMap: new Map() };
  }
}

export default async function PrintApplicationPage({
  searchParams,
}: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  const { student, academic, subjectMap } = studentId
    ? await getApplicationDetails(studentId)
    : { student: null, academic: null, subjectMap: new Map() };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSubjectText = (id: string) => {
    const sub = subjectMap.get(id);
    return sub ? `${sub.name} (${sub.code})` : "N/A";
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-850 p-4 sm:p-8 font-sans selection:bg-blue-900 selection:text-white">
      {/* Print Trigger */}
      {student && <PrintTrigger />}

      {/* Control Actions - hidden in print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm print:hidden">
        <Link
          href={`/admission/success?studentId=${studentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Confirmation
        </Link>
        <button
          type="button"
          onClick={() => typeof window !== "undefined" && window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow shadow-blue-900/10 cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print Application
        </button>
      </div>

      {student && academic ? (
        <article className="max-w-4xl mx-auto bg-white border border-slate-300 print:border-0 rounded-2xl print:rounded-none p-8 sm:p-12 shadow-md print:shadow-none space-y-8 relative overflow-hidden">
          {/* Official Letterhead */}
          <div className="flex flex-col items-center text-center space-y-2 border-b-2 border-slate-800 pb-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {config.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase">
              {config.address}, {config.city}, {config.state} &bull; Pincode:{" "}
              {config.pincode}
            </p>
            <p className="text-[9px] text-slate-400 font-medium">
              Affiliated to Patliputra University, Patna &bull; NAAC Accredited
            </p>
            <div className="pt-2">
              <span className="px-3.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                Admission Application Form (2026-2027)
              </span>
            </div>
          </div>

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Student Photo Placeholder Box */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="w-32 h-40 border border-slate-300 rounded-lg overflow-hidden relative bg-slate-50 flex items-center justify-center text-center p-2">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-[9px] text-slate-400 font-medium">
                    Candidate Photo
                  </span>
                )}
              </div>
            </div>

            {/* Core Identifiers */}
            <div className="md:col-span-3 grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">
                  College Roll No
                </span>
                <span className="font-extrabold text-sm text-slate-900 font-mono">
                  {student.collegeRoll}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">
                  Admission Type
                </span>
                <span className="font-bold text-slate-800">
                  {student.admissionType}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">
                  Unique Admission No (UAN)
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {student.UAN}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">
                  Registration Number
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {student.registrationNumber || "N/A"}
                </span>
              </div>
              <div className="col-span-2 space-y-1">
                <span className="text-slate-450 font-bold uppercase tracking-wider block text-[9px]">
                  Applied Program
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {student.batch?.course?.name} (
                  {student.batch?.academicSession?.name})
                </span>
              </div>
            </div>
          </div>

          {/* Section: Personal Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-slate-100 px-3 py-1 rounded-sm border-l-4 border-slate-800">
              1. Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Candidate Name
                </span>
                <span className="font-bold text-slate-900 uppercase">
                  {student.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Gender
                </span>
                <span className="font-semibold">{student.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Date of Birth
                </span>
                <span className="font-semibold">{formatDate(student.DOB)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Father's Name
                </span>
                <span className="font-bold uppercase">
                  {student.fathersName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Mother's Name
                </span>
                <span className="font-bold uppercase">
                  {student.mothersName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Aadhar Number
                </span>
                <span className="font-mono font-semibold">
                  {student.AadharNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Phone Number
                </span>
                <span className="font-semibold">{student.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Email Address
                </span>
                <span className="font-semibold">{student.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Category / Caste
                </span>
                <span className="font-bold">
                  {student.caste}{" "}
                  {student.reservation ? `(${student.reservation})` : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Religion
                </span>
                <span className="font-semibold">{student.religion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  ABC ID
                </span>
                <span className="font-mono font-semibold">
                  {student.ABCID || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Minority Student
                </span>
                <span className="font-semibold">
                  {student.isMinority ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Course & Subjects */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-slate-100 px-3 py-1 rounded-sm border-l-4 border-slate-800">
              2. Major / Allied Course Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-700">
              <div className="border border-slate-200 rounded-lg p-3 space-y-2.5">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Major Course (MJC)
                  </span>
                  <span className="font-bold text-slate-900">
                    {getSubjectText(student.subMJC)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Minor Course (MIC)
                  </span>
                  <div className="space-y-0.5 font-bold text-slate-900">
                    {(student.subMIC || []).map((id: string) => (
                      <div key={id}>{getSubjectText(id)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Multidisciplinary Course (MDC)
                  </span>
                  <div className="space-y-0.5 font-bold text-slate-900">
                    {(student.subMDC || []).map((id: string) => (
                      <div key={id}>{getSubjectText(id)}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 space-y-2.5">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Ability Enhancement (AEC)
                  </span>
                  <div className="space-y-0.5 font-bold text-slate-900">
                    {(student.subAEC || []).map((id: string) => (
                      <div key={id}>{getSubjectText(id)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Skill Enhancement (SEC)
                  </span>
                  <div className="space-y-0.5 font-bold text-slate-900">
                    {(student.subSEC || []).map((id: string) => (
                      <div key={id}>{getSubjectText(id)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">
                    Value Added Course (VAC)
                  </span>
                  <div className="space-y-0.5 font-bold text-slate-900">
                    {(student.subVAC || []).map((id: string) => (
                      <div key={id}>{getSubjectText(id)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Academic Record */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-slate-100 px-3 py-1 rounded-sm border-l-4 border-slate-800">
              3. Previous Academic Records
            </h2>
            <div className="border border-slate-300 rounded-lg overflow-hidden text-[10px] text-slate-700">
              <table className="min-w-full divide-y divide-slate-300 text-left">
                <thead className="bg-slate-50 font-bold text-slate-800">
                  <tr>
                    <th className="px-4 py-2 border-r border-slate-200">
                      Exam / Degree
                    </th>
                    <th className="px-4 py-2 border-r border-slate-200">
                      Board / University
                    </th>
                    <th className="px-4 py-2 border-r border-slate-200">
                      School / College
                    </th>
                    <th className="px-4 py-2 border-r border-slate-200">
                      Roll (Code-No)
                    </th>
                    <th className="px-4 py-2 text-right">Marks & Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-2.5 font-bold border-r border-slate-200">
                      Higher Secondary (10+2)
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-200">
                      {academic.board}
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-200">
                      {academic.schoolName}
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-200 font-mono">
                      {academic.rollCode ? `${academic.rollCode}-` : ""}
                      {academic.rollNo}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">
                      {academic.obtainedMarks}/{academic.totalMarks} (
                      {academic.percentage}%)
                    </td>
                  </tr>
                  {academic.ugInstituteName && (
                    <tr>
                      <td className="px-4 py-2.5 font-bold border-r border-slate-200">
                        Graduation (UG)
                      </td>
                      <td className="px-4 py-2.5 border-r border-slate-200">
                        {academic.ugUniversityName}
                      </td>
                      <td className="px-4 py-2.5 border-r border-slate-200">
                        {academic.ugInstituteName}
                      </td>
                      <td className="px-4 py-2.5 border-r border-slate-200 font-mono">
                        {academic.ugRollNo || "N/A"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold">
                        {academic.ugObtainedMarks}/{academic.ugTotalMarks} (
                        {academic.ugPercentage}%)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Residential Address */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-950 bg-slate-100 px-3 py-1 rounded-sm border-l-4 border-slate-800">
              4. Address details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-700 border border-slate-200 rounded-lg p-4">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Intermediate School Address
                </span>
                <p className="font-semibold text-slate-800">
                  {academic.address}, {academic.city}, {academic.district},{" "}
                  {academic.state} – {academic.pinCode}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Permanent Residence Address
                </span>
                <p className="font-semibold text-slate-800">
                  {student.city}, {student.district}, {student.state} –{" "}
                  {student.pinCode}
                </p>
              </div>
            </div>
          </div>

          {/* Candidate Declaration */}
          <div className="space-y-4 pt-4 border-t border-slate-200 text-[10px] text-slate-600 leading-relaxed">
            <p>
              <strong>Declaration:</strong> I hereby declare that all the
              information furnished above is correct and true to the best of my
              knowledge and belief. I understand that if any of the details are
              found to be false or incorrect at any stage, my admission will be
              subject to immediate cancellation without refund of fees.
            </p>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 pt-10 text-center font-bold text-slate-800">
              <div className="space-y-1">
                <div className="h-6 border-b border-dashed border-slate-400" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-450 block">
                  Candidate Signature
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-6 border-b border-dashed border-slate-400" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-450 block">
                  Parent / Guardian Signature
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-6 border-b border-dashed border-slate-400" />
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-450 block">
                  College Office Seal & Sign
                </span>
              </div>
            </div>
          </div>
        </article>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">
            Failed to Load Form
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            We could not pull the details for print preview. Please check that
            you provided a valid student identifier.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
