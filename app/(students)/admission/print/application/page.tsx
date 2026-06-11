import { db } from "@/lib/db";
import { AdmittedStudentTable, batchTable, courseTable, academicSessionTable, subjectTable, StudentPreviousAcademicRecordTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { ShieldAlert } from "lucide-react";
import { PrintTrigger } from "../_components/print-trigger";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PrintApplicationPage({ searchParams }: PageProps) {
  const config = getCollegeConfig();
  const resolvedParams = await searchParams;
  const studentId = resolvedParams.studentId as string;

  if (!studentId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-bold text-slate-800 text-sm">Access Denied</h3>
        <p className="text-slate-500 text-xs max-w-sm mt-2">
          No student ID parameters were detected. Please complete the registration workflow.
        </p>
      </div>
    );
  }

  // Fetch student, batch, course, session, and previous academic records
  const student = await db
    .select({
      id: AdmittedStudentTable.id,
      name: AdmittedStudentTable.name,
      collegeRoll: AdmittedStudentTable.collegeRoll,
      UAN: AdmittedStudentTable.UAN,
      registrationNumber: AdmittedStudentTable.registrationNumber,
      universityRoll: AdmittedStudentTable.universityRoll,
      admissionNumber: AdmittedStudentTable.admissionNumber,
      confidentialNumber: AdmittedStudentTable.confidentialNumber,
      profileNumber: AdmittedStudentTable.profileNumber,
      admissionType: AdmittedStudentTable.admissionType,
      ABCID: AdmittedStudentTable.ABCID,
      avatar: AdmittedStudentTable.avatar,
      DOB: AdmittedStudentTable.DOB,
      AadharNumber: AdmittedStudentTable.AadharNumber,
      phone: AdmittedStudentTable.phone,
      email: AdmittedStudentTable.email,
      gender: AdmittedStudentTable.gender,
      fathersName: AdmittedStudentTable.fathersName,
      mothersName: AdmittedStudentTable.mothersName,
      religion: AdmittedStudentTable.religion,
      caste: AdmittedStudentTable.caste,
      reservation: AdmittedStudentTable.reservation,
      isMinority: AdmittedStudentTable.isMinority,
      city: AdmittedStudentTable.city,
      district: AdmittedStudentTable.district,
      state: AdmittedStudentTable.state,
      pinCode: AdmittedStudentTable.pinCode,
      
      courseName: courseTable.name,
      courseCode: courseTable.code,
      courseType: courseTable.type,
      sessionName: academicSessionTable.name,
      
      schoolName: StudentPreviousAcademicRecordTable.schoolName,
      board: StudentPreviousAcademicRecordTable.board,
      obtainedMarks: StudentPreviousAcademicRecordTable.obtainedMarks,
      totalMarks: StudentPreviousAcademicRecordTable.totalMarks,
      percentage: StudentPreviousAcademicRecordTable.percentage,
      rollNo: StudentPreviousAcademicRecordTable.rollNo,
      rollCode: StudentPreviousAcademicRecordTable.rollCode,
      academicAddress: StudentPreviousAcademicRecordTable.address,
      academicCity: StudentPreviousAcademicRecordTable.city,
      academicDistrict: StudentPreviousAcademicRecordTable.district,
      academicState: StudentPreviousAcademicRecordTable.state,
      academicPinCode: StudentPreviousAcademicRecordTable.pinCode,
      
      ugInstituteName: StudentPreviousAcademicRecordTable.ugInstituteName,
      ugUniversityName: StudentPreviousAcademicRecordTable.ugUniversityName,
      ugObtainedMarks: StudentPreviousAcademicRecordTable.ugObtainedMarks,
      ugTotalMarks: StudentPreviousAcademicRecordTable.ugTotalMarks,
      ugPercentage: StudentPreviousAcademicRecordTable.ugPercentage,
      ugRollNo: StudentPreviousAcademicRecordTable.ugRollNo,
      
      subMJC: AdmittedStudentTable.subMJC,
      subMIC: AdmittedStudentTable.subMIC,
      subMDC: AdmittedStudentTable.subMDC,
      subAEC: AdmittedStudentTable.subAEC,
      subSEC: AdmittedStudentTable.subSEC,
      subVAC: AdmittedStudentTable.subVAC,
    })
    .from(AdmittedStudentTable)
    .innerJoin(batchTable, eq(AdmittedStudentTable.batchId, batchTable.id))
    .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
    .innerJoin(academicSessionTable, eq(batchTable.academicSessionId, academicSessionTable.id))
    .leftJoin(StudentPreviousAcademicRecordTable, eq(StudentPreviousAcademicRecordTable.studentId, AdmittedStudentTable.id))
    .where(eq(AdmittedStudentTable.id, studentId))
    .then((rows) => rows[0]);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h3 className="font-bold text-slate-800 text-sm">Student Record Not Found</h3>
        <p className="text-slate-500 text-xs max-w-sm mt-2">
          We could not resolve any admitted student details matching this student ID.
        </p>
      </div>
    );
  }

  // Load subject names
  const allSubjectIds = [
    student.subMJC,
    ...(student.subMIC || []),
    ...(student.subMDC || []),
    ...(student.subAEC || []),
    ...(student.subSEC || []),
    ...(student.subVAC || []),
  ].filter(Boolean);

  let subjects: any[] = [];
  if (allSubjectIds.length > 0) {
    subjects = await db
      .select()
      .from(subjectTable)
      .where(inArray(subjectTable.id, allSubjectIds));
  }

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const getSubjectName = (idOrArr: any) => {
    if (!idOrArr) return "N/A";
    if (Array.isArray(idOrArr)) {
      return idOrArr.map(id => subjectMap.get(id)?.name || id).join(", ");
    }
    return subjectMap.get(idOrArr)?.name || idOrArr;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-serif leading-relaxed text-xs">
      {/* Client Trigger Component */}
      <PrintTrigger />

      {/* Printable Sheet */}
      <div className="max-w-[800px] mx-auto p-8 sm:p-12 space-y-8 print:p-0">
        
        {/* Form Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-2 relative">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">{config.name}</h1>
          <p className="text-[10px] font-semibold text-slate-500 tracking-wider">
            AFFILIATED TO PATLIPUTRA UNIVERSITY, PATNA &bull; NAAC ACCREDITED
          </p>
          <p className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md w-fit mx-auto uppercase">
            Admission Application Form ({student.sessionName})
          </p>

          {/* College Roll Box */}
          <div className="absolute right-0 top-0 border border-slate-900 px-3 py-1.5 rounded bg-slate-50 text-[10px] text-right font-mono hidden sm:block">
            <span className="block text-[8px] text-slate-400 font-sans uppercase font-bold">College Roll No.</span>
            <span className="font-bold text-slate-800">{student.collegeRoll}</span>
          </div>
        </div>

        {/* Photo & Primary Identifiers Block */}
        <div className="grid grid-cols-4 gap-6 items-start">
          
          <div className="col-span-3 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-1">
              1. Admission & Identification Details
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Unique Admission No (UAN)</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{student.UAN}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Registration Number</span>
                <span className="font-semibold text-slate-800">{student.registrationNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Applied Course</span>
                <span className="font-semibold text-slate-800">{student.courseName} ({student.courseType})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Admission Category</span>
                <span className="font-semibold text-slate-800">{student.admissionType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Academic Session</span>
                <span className="font-semibold text-slate-800">{student.sessionName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">ABC ID</span>
                <span className="font-semibold text-slate-800 font-mono">{student.ABCID || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Student Photo */}
          <div className="flex flex-col items-center justify-center col-span-1">
            <div className="w-[120px] h-[140px] border border-slate-300 bg-slate-50 rounded overflow-hidden flex items-center justify-center relative shadow-inner">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[9px] text-slate-400 font-sans text-center px-2">Affix Recent Passport Photo</span>
              )}
            </div>
            {student.collegeRoll && (
              <span className="text-[9px] font-mono font-bold text-slate-600 mt-1.5">
                Roll: {student.collegeRoll}
              </span>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-1">
            2. Personal Profile Information
          </h3>
          <div className="grid grid-cols-3 gap-y-3 gap-x-4">
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Candidate Name</span>
              <span className="font-bold text-slate-800 uppercase">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Father's Name</span>
              <span className="font-semibold text-slate-800 uppercase">{student.fathersName}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Mother's Name</span>
              <span className="font-semibold text-slate-800 uppercase">{student.mothersName}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Date of Birth</span>
              <span className="font-semibold text-slate-800">{formatDate(student.DOB)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Gender</span>
              <span className="font-semibold text-slate-800">{student.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Aadhar Number</span>
              <span className="font-semibold text-slate-800 font-mono">{student.AadharNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Caste Category</span>
              <span className="font-semibold text-slate-800">{student.caste}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Religion</span>
              <span className="font-semibold text-slate-800">{student.religion}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Minority Community</span>
              <span className="font-semibold text-slate-800">{student.isMinority ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Mobile Phone</span>
              <span className="font-semibold text-slate-800 font-mono">{student.phone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Email Address</span>
              <span className="font-semibold text-slate-800 break-all">{student.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <div>
              <span className="text-slate-400 block uppercase text-[9px] font-semibold">Residential Address</span>
              <span className="font-semibold text-slate-800 uppercase">
                {student.city}, {student.district}, {student.state} – {student.pinCode}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Subjects */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-1">
            3. Subject Choice Selection (CBCS)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Major Course (MJC)</span>
              <p className="font-bold text-slate-800">{getSubjectName(student.subMJC)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Minor Course (MIC)</span>
              <p className="font-semibold text-slate-800">{getSubjectName(student.subMIC)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Multidisciplinary (MDC)</span>
              <p className="font-semibold text-slate-800">{getSubjectName(student.subMDC)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Ability Enhancement (AEC)</span>
              <p className="font-semibold text-slate-800">{getSubjectName(student.subAEC)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Skill Enhancement (SEC)</span>
              <p className="font-semibold text-slate-800">{getSubjectName(student.subSEC)}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">Value Added Course (VAC)</span>
              <p className="font-semibold text-slate-800">{getSubjectName(student.subVAC)}</p>
            </div>
          </div>
        </div>

        {/* Previous Academic Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase border-b border-slate-200 pb-1">
            4. Prior Academic Background
          </h3>
          
          <table className="w-full border-collapse border border-slate-300 text-left text-[11px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-500">Qualifying Exam</th>
                <th className="border border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-500">School/College & Board</th>
                <th className="border border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-500 text-center">Marks</th>
                <th className="border border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-500 text-center">Percentage</th>
                <th className="border border-slate-300 p-2 font-bold uppercase text-[9px] text-slate-500 text-center">Roll No (Code)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2 font-semibold">Intermediate (10+2)</td>
                <td className="border border-slate-300 p-2">
                  <p className="font-semibold uppercase text-slate-800">{student.schoolName}</p>
                  <p className="text-[10px] text-slate-400 uppercase mt-0.5">{student.board}</p>
                </td>
                <td className="border border-slate-300 p-2 text-center font-semibold">
                  {student.obtainedMarks} / {student.totalMarks}
                </td>
                <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                  {student.percentage}%
                </td>
                <td className="border border-slate-300 p-2 text-center font-mono font-semibold">
                  {student.rollNo} {student.rollCode ? `(${student.rollCode})` : ""}
                </td>
              </tr>
              {student.ugInstituteName && (
                <tr>
                  <td className="border border-slate-300 p-2 font-semibold">Graduation (UG)</td>
                  <td className="border border-slate-300 p-2">
                    <p className="font-semibold uppercase text-slate-800">{student.ugInstituteName}</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">{student.ugUniversityName}</p>
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-semibold">
                    {student.ugObtainedMarks} / {student.ugTotalMarks}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                    {student.ugPercentage}%
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-semibold">
                    {student.ugRollNo}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Declarations & Signatures */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="space-y-2 text-[10px] text-slate-500 leading-relaxed font-sans">
            <p className="font-bold uppercase text-slate-700">Student & Parent Declaration</p>
            <p>
              I hereby declare that all the statements and details filled in this admission application form are true, complete, and correct to the best of my knowledge and belief. I understand that if any of the information is found false or inaccurate at any stage, my admission will be cancelled immediately by the college management.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-10 text-center font-semibold text-[10px] text-slate-700">
            <div className="space-y-4">
              <div className="h-10 border-b border-dashed border-slate-400" />
              <span>Signature of Candidate</span>
            </div>
            <div className="space-y-4">
              <div className="h-10 border-b border-dashed border-slate-400" />
              <span>Signature of Parent/Guardian</span>
            </div>
            <div className="space-y-4">
              <div className="h-10 border-b border-dashed border-slate-400" />
              <span>Principal / Office Verification</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
