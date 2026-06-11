"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { useGetBatchesByCourse } from "@/app/(departments)/course/[id]/query/get-batches";
import { Badge } from "@/components/ui/badge";

export type BatchRow = NonNullable<
  ReturnType<typeof useGetBatchesByCourse>["data"]
>[number];

export const columns: ColumnDef<BatchRow>[] = [
  {
    accessorKey: "academicSession.name",
    header: "Academic Session",
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.original.academicSession.name}</div>
      );
    },
  },
  {
    accessorKey: "perSemesterFee",
    header: "Fee / Semester",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          ₹{row.original.perSemesterFee.toLocaleString("en-IN")}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "destructive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "PPP")}
        </div>
      );
    },
  },
];
