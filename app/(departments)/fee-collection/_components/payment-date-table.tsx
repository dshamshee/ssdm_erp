"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconDownload } from "@tabler/icons-react";

interface PaymentDateTableProps {
  payments: any[];
}

export function PaymentDateTable({ payments }: PaymentDateTableProps) {
  const totalAmountCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [payments]);

  const handleExportCSV = () => {
    const headers = [
      "S.No",
      "College Roll",
      "UAN",
      "Student Name",
      "Phone",
      "Course Name",
      "Batch / Session",
      "Semester",
      "Amount Paid",
      "Payment Mode",
      "Transaction ID",
      "Payment Date",
      "Admission Date",
    ];

    const rows = payments.map((payment, index) => {
      const student = payment.student;
      const courseName = student?.batch?.course?.name ?? "N/A";
      const batchSession = student?.batch?.academicSession?.name ?? "N/A";

      return [
        index + 1,
        student?.collegeRoll ?? "N/A",
        student?.UAN ?? "N/A",
        `"${student?.name ?? "N/A"}"`,
        student?.phone ?? "N/A",
        `"${courseName}"`,
        `"${batchSession}"`,
        `"Semester ${payment.semesterCount}"`,
        payment.amount,
        payment.paymentMode,
        payment.transactionId,
        new Date(payment.createdAt).toLocaleDateString("en-IN"),
        student?.createdAt
          ? new Date(student.createdAt).toLocaleDateString("en-IN")
          : "N/A",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `payments_collected_report_${new Date().getTime()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Payments Received List
          </h2>
          <p className="text-sm text-slate-500">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} — Total
            Collected: ₹{totalAmountCollected.toLocaleString("en-IN")}
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="gap-2"
          disabled={payments.length === 0}
        >
          <IconDownload size={16} />
          Export to CSV
        </Button>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">S.No</TableHead>
              <TableHead>College Roll</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Session / Batch</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Admission Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center text-muted-foreground h-32"
                >
                  No payments found for the selected date.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment, index) => {
                const student = payment.student;
                const courseName = student?.batch?.course?.name ?? "N/A";
                const batchSession =
                  student?.batch?.academicSession?.name ?? "N/A";

                return (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student?.collegeRoll ?? "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{student?.name ?? "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {student?.UAN ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {student?.phone ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm">{courseName}</TableCell>
                    <TableCell className="text-sm">{batchSession}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="secondary" className="text-xs">
                        Semester {payment.semesterCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.paymentMode}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {student?.createdAt
                        ? new Date(student.createdAt).toLocaleDateString(
                            "en-IN",
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {payments.length > 0 && (
            <TableFooter>
              <TableRow className="bg-slate-50/70">
                <TableCell
                  colSpan={7}
                  className="font-bold text-slate-800 text-right pr-4"
                >
                  Total (Payments: {payments.length})
                </TableCell>
                <TableCell className="font-bold text-emerald-800">
                  ₹{totalAmountCollected.toLocaleString("en-IN")}
                </TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
}
