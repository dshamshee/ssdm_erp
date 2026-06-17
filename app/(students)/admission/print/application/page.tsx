import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import { batchTable, subjectTable } from "@/lib/db/schema/department";
import { AdmittedStudentTable } from "@/lib/db/schema/student";
import { PrinterTrigger } from "../receipt/_components/printer-trigger";

interface ApplicationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PrintableApplicationPage({
  searchParams,
}: ApplicationPageProps) {
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string | undefined;

  if (!studentId) {
    redirect("/admission");
  }

  const student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.id, studentId),
    with: { previousAcademicRecord: true, documents: true },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-red-600 font-sans">
        Error: Candidate registration profile not found.
      </div>
    );
  }

  // Fetch batch details
  const batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.id, student.batchId),
    with: { course: true, academicSession: true },
  });

  if (!batch) {
    return (
      <div className="p-8 text-center text-red-600 font-sans">
        Error: Batch details not found.
      </div>
    );
  }

  // Gather chosen subject IDs
  const allSubjectIds = [
    student.subMJC,
    ...(student.subMIC || []),
    ...(student.subMDC || []),
    ...(student.subAEC || []),
    ...(student.subSEC || []),
    ...(student.subVAC || []),
  ].filter(Boolean) as string[];

  const subjects =
    allSubjectIds.length > 0
      ? await db
        .select()
        .from(subjectTable)
        .where(inArray(subjectTable.id, allSubjectIds))
      : [];

  const getSubjectText = (id: string | null | undefined) => {
    if (!id) {
      return "N/A";
    }
    const sub = subjects.find((s) => s.id === id);
    return sub ? `${sub.code} - ${sub.name}` : "N/A";
  };

  const getSubjectListText = (ids: string[] | null | undefined) => {
    if (!ids || ids.length === 0) {
      return "N/A";
    }
    return (
      ids
        .map((id) => {
          const sub = subjects.find((s) => s.id === id);
          return sub ? `${sub.code} - ${sub.name}` : null;
        })
        .filter(Boolean)
        .join(", ") || "N/A"
    );
  };

  const college = getCollegeConfig();
  const photoUrl = student.documents?.photo || student.avatar || "";
  const signatureUrl = student.documents?.signature || "";

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans selection:bg-slate-200 print:p-0">
      <PrinterTrigger delayMs={800} />

      {/* College Header */}
      <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1 relative">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {college.name}
        </h1>
        <p className="text-xs text-slate-500 font-medium font-serif">
          Affiliated with University • Government Registered Institution
        </p>
        <p className="text-[10px] text-slate-400 font-mono">
          Email: support@ssdmcollege.ac.in • Address: Patna, Bihar, India
        </p>
      </div>

      <div className="my-6 text-center">
        <span className="border-2 border-slate-900 px-6 py-1.5 text-xs font-black uppercase tracking-widest bg-slate-50">
          Admission Application Form
        </span>
      </div>

      {/* Profile Photo and General Metadata */}
      <div className="flex justify-between items-start gap-8 mt-6">
        <div className="flex-grow space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Admission Course
              </span>
              <p className="font-extrabold text-slate-800 mt-0.5 text-sm">
                {batch.course.name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Academic Session
              </span>
              <p className="font-bold text-slate-800 mt-0.5 text-sm">
                {batch.academicSession.name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                UAN Reference
              </span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {student.UAN}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                College Roll Number
              </span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {student.collegeRoll}
              </p>
            </div>
          </div>
        </div>

        {/* Passport Photo Frame */}
        <div className="shrink-0">
          <div className="h-32 w-28 border border-slate-300 relative overflow-hidden bg-slate-50 flex items-center justify-center rounded-md">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Student Passport"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[9px] text-slate-400 font-bold text-center p-2 uppercase">
                Photo Not Uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* A. Personal Identification */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1">
          A. Candidate Personal Information
        </h3>
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-xs border border-slate-200 rounded-xl p-5 bg-slate-50/50">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Student's Name
            </span>
            <p className="font-extrabold text-slate-800 mt-0.5">
              {student.name}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Date of Birth
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {new Date(student.DOB).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Gender
            </span>
            <p className="font-bold text-slate-800 mt-0.5">{student.gender}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Father's Name
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.fathersName}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Mother's Name
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.mothersName}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Religion
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.religion}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Category / Caste
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.caste}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Aadhar ID Number
            </span>
            <p className="font-mono font-semibold text-slate-700 mt-0.5">
              {student.AadharNumber}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              ABC ID Number
            </span>
            <p className="font-mono font-semibold text-slate-700 mt-0.5">
              {student.ABCID || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Candidate Mobile
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.phone}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Candidate Email
            </span>
            <p className="font-semibold text-slate-700 mt-0.5 truncate">
              {student.email}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Minority Status
            </span>
            <p className="font-semibold text-slate-700 mt-0.5">
              {student.isMinority ? "YES" : "NO"}
            </p>
          </div>
          <div className="col-span-3">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
              Correspondence Address
            </span>
            <p className="font-medium text-slate-700 mt-0.5">
              {student.city}, District: {student.district}, State:{" "}
              {student.state} - {student.pinCode}
            </p>
          </div>
        </div>
      </div>

      {/* B. Subject Choices */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1">
          B. Course Subject Combinations
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-4 py-2 w-1/3">Course Structure Component</th>
                <th className="px-4 py-2">Assigned Subject Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Major Course (MJC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectText(student.subMJC)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Minor Course (MIC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectListText(student.subMIC)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Multidisciplinary Course (MDC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectListText(student.subMDC)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Ability Enhancement Course (AEC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectListText(student.subAEC)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Skill Enhancement Course (SEC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectListText(student.subSEC)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-800">
                  Value Added Course (VAC)
                </td>
                <td className="px-4 py-2.5 font-medium text-slate-700">
                  {getSubjectListText(student.subVAC)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Academic Record */}
      {student.previousAcademicRecord && (
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1">
            C. Prior Academic Record (10+2 / Intermediate)
          </h3>
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-xs border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                High School / Institute
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {student.previousAcademicRecord.schoolName}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Board of Education
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {student.previousAcademicRecord.board}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Percentage Obtained
              </span>
              <p className="font-bold text-slate-800 mt-0.5">
                {student.previousAcademicRecord.percentage}%
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Obtained / Total Marks
              </span>
              <p className="font-semibold text-slate-700 mt-0.5">
                {student.previousAcademicRecord.obtainedMarks} /{" "}
                {student.previousAcademicRecord.totalMarks}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Roll Code
              </span>
              <p className="font-mono font-semibold text-slate-700 mt-0.5">
                {student.previousAcademicRecord.rollCode}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Roll Number
              </span>
              <p className="font-mono font-semibold text-slate-700 mt-0.5">
                {student.previousAcademicRecord.rollNo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* D. Uploaded Document Checklist */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1">
          D. Uploaded Support Document Checklist
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              Aadhar Identity Card:{" "}
              <span className="font-bold text-emerald-700">SUBMITTED</span>
            </li>
            <li>
              Previous Leaving Certificate:{" "}
              <span className="font-bold text-emerald-700">SUBMITTED</span>
            </li>
            <li>
              Previous Migration Certificate:{" "}
              <span className="font-bold text-emerald-700">SUBMITTED</span>
            </li>
          </ul>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>
              Previous Marksheet / Certificate:{" "}
              <span className="font-bold text-emerald-700">SUBMITTED</span>
            </li>
            <li>
              Caste / Domicile Certificate:{" "}
              <span className="font-bold text-slate-600">
                {student.documents?.cast ? "SUBMITTED" : "N/A"}
              </span>
            </li>
            <li>
              Income Certificate:{" "}
              <span className="font-bold text-slate-600">
                {student.documents?.income ? "SUBMITTED" : "N/A"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* E. Student Portal Login Credentials */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1">
          E. Student Portal Login Credentials
        </h3>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-amber-50/40">
          <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-relaxed">
            Use the credentials below to access the Student Portal. Please
            change your password after your first login.
          </p>
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                User ID
              </span>
              <p className="font-mono font-black text-slate-900 mt-0.5 text-sm tracking-wide bg-white border border-slate-200 rounded-lg px-3 py-1.5 inline-block">
                {student.UAN}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Default Password
              </span>
              <p className="font-semibold text-slate-700 mt-1 text-[11px] leading-relaxed">
                Your password is:{" "}
                <span className="font-black text-slate-900">
                  First 4 letters of your name (lowercase, no spaces)
                </span>{" "}
                +{" "}
                <span className="font-black text-slate-900">
                  Last 4 digits of your Aadhar number
                </span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                Example: If name is{" "}
                <span className="font-bold not-italic">Rahul Kumar</span> and
                Aadhar is{" "}
                <span className="font-mono font-bold not-italic">
                  9876 5432 1098
                </span>
                , then password ={" "}
                <span className="font-mono font-bold not-italic bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                  rahu1098
                </span>
              </p>
            </div>
          </div>
          <p className="text-[9px] text-red-500 font-bold mt-3 uppercase tracking-wider">
            ⚠ Keep your login credentials confidential. Do not share your
            password with anyone.
          </p>
        </div>
      </div>

      {/* Signatures & Declarations */}
      <div className="mt-12 space-y-4">
        <p className="text-[10px] text-slate-400 leading-relaxed text-justify">
          <strong>Declaration:</strong> I hereby declare that all details
          provided in this application form are true and accurate to the best of
          my knowledge. If any detail is found incorrect or misleading, the
          college maintains the full right to detrain and cancel my admission
          without any refund.
        </p>
        <div className="grid grid-cols-2 gap-12 text-xs pt-4">
          <div className="flex flex-col items-start justify-end space-y-2">
            <div className="h-16 w-40 flex items-center justify-center border-b border-slate-400">
              {signatureUrl ? (
                <img
                  src={signatureUrl}
                  alt="Candidate Handwritten Signature"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[9px] text-slate-300 italic">
                  No signature uploaded
                </span>
              )}
            </div>
            <p className="text-slate-600 font-bold uppercase tracking-wider">
              Signature of Candidate
            </p>
          </div>
          <div className="flex flex-col items-end justify-end space-y-2">
            <div className="h-16 w-40 border-b border-slate-400 flex items-center justify-center text-slate-200 text-[10px] italic">
              Verification Stamp
            </div>
            <p className="text-slate-600 font-bold uppercase tracking-wider text-right">
              Admissions Officer / Dean
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
