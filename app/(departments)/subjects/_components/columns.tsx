"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { useGetSubjects } from "@/app/(departments)/subjects/query/get-subjects";
import { Badge } from "@/components/ui/badge";

export type SubjectRow = NonNullable<
  ReturnType<typeof useGetSubjects>["data"]
>[number];

export const columns: ColumnDef<SubjectRow>[] = [
  {
    accessorKey: "name",
    header: "Subject",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.original.code}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const typeColors: Record<string, string> = {
        MJC: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        MIC: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        MDC: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        SEC: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        VAC: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <Badge className={typeColors[row.original.type]}>
          {row.original.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "hasPractical",
    header: "Practical",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.hasPractical ? "default" : "secondary"}>
          {row.original.hasPractical ? "Yes" : "No"}
        </Badge>
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
];
