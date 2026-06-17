"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DeleteAdmissionOpenDialog } from "./delete-admission-open-dialog";
import {
  type AdmissionOpenRow,
  EditAdmissionOpenSheet,
} from "./edit-admission-open-sheet";

export const columns: ColumnDef<AdmissionOpenRow>[] = [
  {
    accessorKey: "batch",
    header: "Course & Session",
    cell: ({ row }) => {
      const batch = row.original.batch;
      if (!batch) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">
            {batch.course.name}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {batch.academicSession.name} ({batch.course.code})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {format(new Date(row.original.startDate), "PPP")}
        </span>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {format(new Date(row.original.endDate), "PPP")}
        </span>
      );
    },
  },
  {
    accessorKey: "lateFee",
    header: "Late Fee",
    cell: ({ row }) => {
      const fee = row.original.lateFee ?? 0;
      return (
        <span className="font-mono text-muted-foreground">
          {fee > 0 ? `₹${fee}` : "No fee"}
        </span>
      );
    },
  },
  {
    accessorKey: "practicalFee",
    header: "Practical Fee",
    cell: ({ row }) => {
      const fee = row.original.practicalFee ?? 0;
      return (
        <span className="font-mono text-muted-foreground">
          {fee > 0 ? `₹${fee}` : "No fee"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const today = new Date();
      // Remove time component for comparison
      today.setHours(0, 0, 0, 0);

      const record = row.original;
      const start = new Date(record.startDate);
      start.setHours(0, 0, 0, 0);

      const end =
        record.isDateExtended && record.extendedDate
          ? new Date(record.extendedDate)
          : new Date(record.endDate);
      end.setHours(0, 0, 0, 0);

      if (today < start) {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            Scheduled
          </Badge>
        );
      } else if (today > end) {
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            Closed
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Open
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "extendedDate",
    header: "Extended To",
    cell: ({ row }) => {
      const record = row.original;
      if (!record.isDateExtended || !record.extendedDate) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {format(new Date(record.extendedDate), "PPP")}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditAdmissionOpenSheet record={record} />
          <DeleteAdmissionOpenDialog
            id={record.id}
            courseName={record.batch?.course?.name ?? "N/A"}
            sessionName={record.batch?.academicSession?.name ?? "N/A"}
          />
        </div>
      );
    },
  },
];
