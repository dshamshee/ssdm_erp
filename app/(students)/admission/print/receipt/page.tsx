import { db } from "@/lib/db";
import { StudentFeePaymentTable } from "@/lib/db/schema/student";
import { batchTable, courseTable, subjectTable, admissionOpenTable } from "@/lib/db/schema/department";
import { eq, inArray } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { redirect } from "next/navigation";
import { PrinterTrigger } from "./_components/printer-trigger";

interface ReceiptPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PrintableReceiptPage({ searchParams }: ReceiptPageProps) {
  const resolvedParams = await searchParams;
  const paymentId = resolvedParams.paymentId as string | undefined;

  if (!paymentId) {
    redirect("/admission");
  }

  const payment = await db.query.StudentFeePaymentTable.findFirst({
    where: eq(StudentFeePaymentTable.id, paymentId),
    with: {
      student: true,
    },
  });

  if (!payment || !payment.student) {
    return (
      <div className="p-8 text-center text-red-600 font-sans">
        Error: Payment transaction record or candidate details not found.
      </div>
    );
  }

  const student = payment.student;

  // Fetch batch details
  const batch = await db.query.batchTable.findFirst({
    where: eq(batchTable.id, student.batchId),
    with: {
      course: true,
      academicSession: true,
    },
  });

  if (!batch) {
    return (
      <div className="p-8 text-center text-red-600 font-sans">
        Error: Course batch configuration not found.
      </div>
    );
  }

  // Calculate fee breakdown
  const tuitionFee = batch.perSemesterFee;
  
  // Check if student has practical subjects
  const allSubjectIds = [
    student.subMJC,
    ...(student.subMIC || []),
    ...(student.subMDC || []),
    ...(student.subAEC || []),
    ...(student.subSEC || []),
    ...(student.subVAC || []),
  ].filter(Boolean) as string[];

  let hasPractical = false;
  if (allSubjectIds.length > 0) {
    const subjects = await db
      .select({ hasPractical: subjectTable.hasPractical })
      .from(subjectTable)
      .where(inArray(subjectTable.id, allSubjectIds));
    hasPractical = subjects.some((s) => s.hasPractical === true);
  }

  // Fetch admission window details for practical fee check
  const admissionOpen = await db.query.admissionOpenTable.findFirst({
    where: eq(admissionOpenTable.batchId, student.batchId),
  });

  const practicalFee = hasPractical ? (admissionOpen?.practicalFee ?? 500) : 0;
  const totalAmount = Number(payment.amount);
  const lateFee = Math.max(0, totalAmount - tuitionFee - practicalFee);

  const college = getCollegeConfig();

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans selection:bg-slate-200">
      <PrinterTrigger delayMs={500} />
      
      {/* College Letterhead */}
      <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{college.name}</h1>
        <p className="text-xs text-slate-500 font-medium font-serif">
          Affiliated with University • Government Registered Institution
        </p>
        <p className="text-xs text-slate-500 font-mono">
          Email: support@ssdmcollege.ac.in • Web: www.ssdmcollege.ac.in
        </p>
      </div>

      <div className="my-6 text-center">
        <span className="border-2 border-slate-900 px-6 py-1.5 text-xs font-black uppercase tracking-widest bg-slate-50">
          Admission Fee Receipt (Semester I)
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs border border-slate-200 rounded-xl p-6 bg-slate-50/50">
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Candidate Name</span>
          <p className="font-extrabold text-slate-800 mt-0.5 text-sm">{student.name}</p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">UAN (Registration No.)</span>
          <p className="font-mono font-bold text-slate-800 mt-0.5 text-sm">{student.UAN}</p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">College Roll Number</span>
          <p className="font-mono font-bold text-slate-800 mt-0.5 text-sm">{student.collegeRoll}</p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Course Session</span>
          <p className="font-semibold text-slate-800 mt-0.5 text-sm">
            {batch.course.name} ({batch.academicSession.name})
          </p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Email Address</span>
          <p className="font-medium text-slate-700 mt-0.5">{student.email}</p>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Mobile Phone</span>
          <p className="font-medium text-slate-700 mt-0.5">{student.phone}</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mt-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
          Transaction Confirmation Info
        </h3>
        <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
          <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px]">
            <tr>
              <th className="px-4 py-2">Invoice Order ID</th>
              <th className="px-4 py-2">Gateway Txn ID</th>
              <th className="px-4 py-2">Payment Mode</th>
              <th className="px-4 py-2">Payment Date</th>
              <th className="px-4 py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            <tr>
              <td className="px-4 py-3">{payment.id}</td>
              <td className="px-4 py-3">{payment.transactionId}</td>
              <td className="px-4 py-3 font-sans font-medium">{payment.paymentMode}</td>
              <td className="px-4 py-3 font-sans">
                {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                  timeZone: "UTC",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-sans font-black text-emerald-700">CONFIRMED</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fee Breakdown */}
      <div className="mt-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1">
          Fee breakup
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-4 py-2">Fee Component Description</th>
                <th className="px-4 py-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700">Admission / Tuition Fee</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">₹{tuitionFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700">
                  Practical Laboratory Surcharge {practicalFee > 0 && <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded font-bold ml-1.5">APPLIED</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">₹{practicalFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700">
                  Late Registration Fine {lateFee > 0 && <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold ml-1.5">LATE WINDOW</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">₹{lateFee.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="bg-slate-50/80 font-bold border-t-2 border-slate-300 text-sm">
                <td className="px-4 py-3 text-slate-900 font-extrabold">Total Amount Authenticated</td>
                <td className="px-4 py-3 text-right text-emerald-700 font-black font-mono">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Student Portal Login Credentials */}
      <div className="mt-6 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
          Student Portal Login Credentials
        </h3>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 bg-amber-50/40">
          <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-relaxed">
            Use the credentials below to access the Student Portal. Please change your password after your first login.
          </p>
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">User ID</span>
              <p className="font-mono font-black text-slate-900 mt-0.5 text-sm tracking-wide bg-white border border-slate-200 rounded-lg px-3 py-1.5 inline-block">
                {student.UAN}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Default Password</span>
              <p className="font-semibold text-slate-700 mt-1 text-[11px] leading-relaxed">
                Your password is: <span className="font-black text-slate-900">First 3 letters of your name (lowercase)</span> + <span className="font-black text-slate-900">Last 5 digits of your Aadhar number</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                Example: If name is <span className="font-bold not-italic">Rahul Kumar</span> and Aadhar is <span className="font-mono font-bold not-italic">9876 5432 1098</span>, then password = <span className="font-mono font-bold not-italic bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">rah21098</span>
              </p>
            </div>
          </div>
          <p className="text-[9px] text-red-500 font-bold mt-3 uppercase tracking-wider">
            ⚠ Keep your login credentials confidential. Do not share your password with anyone.
          </p>
        </div>
      </div>

      {/* Terms & Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-xs border-t border-slate-100 pt-6">
        <div className="space-y-1">
          <p className="font-bold text-slate-800">Important Instructions:</p>
          <ul className="list-disc pl-4 space-y-1 text-slate-500 leading-relaxed text-[11px]">
            <li>This receipt serves as temporary validation of your admission.</li>
            <li>Keep this receipt safe for future registration and class allotments.</li>
            <li>Fee once paid is non-refundable under any circumstances.</li>
          </ul>
        </div>
        <div className="flex flex-col items-end justify-end space-y-1 pb-2">
          <div className="h-12 w-36 border-b border-slate-400 flex items-center justify-center text-slate-300 text-[10px] italic">
            Computer Generated
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider text-right">
            Authorised Registrar Seal
          </p>
        </div>
      </div>
    </div>
  );
}
