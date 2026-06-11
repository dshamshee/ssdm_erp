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
      return (
        <div className="text-sm text-muted-foreground">{row.original.code}</div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const categoryColors: Record<string, string> = {
        SCIENCE:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        COMMERCE:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        ARTS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
      return (
        <Badge
          className={
            row.original.category
              ? categoryColors[row.original.category]
              : "bg-gray-100 text-gray-800"
          }
        >
          {row.original.category || "N/A"}
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
