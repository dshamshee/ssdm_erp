import { db } from "@/lib/db";
import { StudentFeePaymentTable, AdmittedStudentTable } from "@/lib/db/schema/student";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MockCheckoutContainer } from "./_components/mock-checkout-container";

interface PageProps {
  searchParams: Promise<{ paymentId?: string }>;
}

export default async function MockCheckoutPage({ searchParams }: PageProps) {
  const { paymentId } = await searchParams;

  if (!paymentId) {
    redirect("/admission/payment");
  }

  // Fetch payment details
  const payment = await db.query.StudentFeePaymentTable.findFirst({
    where: eq(StudentFeePaymentTable.id, paymentId),
  });

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-slate-800">Payment Record Not Found</h2>
          <p className="mt-2 text-slate-500">The requested transaction reference does not exist.</p>
        </div>
      </div>
    );
  }

  // Fetch student details
  const student = await db.query.AdmittedStudentTable.findFirst({
    where: eq(AdmittedStudentTable.id, payment.studentId),
  });

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-slate-800">Student Record Not Found</h2>
          <p className="mt-2 text-slate-500">The student associated with this payment was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <MockCheckoutContainer 
      paymentId={paymentId} 
      studentName={student.name || "Student"} 
      uan={student.UAN || "N/A"} 
      amount={Number(payment.amount)} 
    />
  );
}
