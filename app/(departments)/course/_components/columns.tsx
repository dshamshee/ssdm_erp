"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { useGetCourses } from "@/app/(departments)/course/query/get-courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type CourseRow = NonNullable<
  ReturnType<typeof useGetCourses>["data"]
>[number];

export const columns: ColumnDef<CourseRow>[] = [
  {
    accessorKey: "name",
    header: "Course",
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
    accessorKey: "department.name",
    header: "Department",
    cell: ({ row }) => {
      return <div>{row.original.department.name}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="whitespace-nowrap">
          {row.original.type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.original.duration}{" "}
          {row.original.duration === 1 ? "Year" : "Years"}
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
    id: "batches",
    header: "Batches",
    cell: ({ row }) => {
      return (
        <Link href={`/course/${row.original.id}`}>
          <Button variant="ghost" size="icon-sm">
            <ChevronRight data-icon="inline-start" />
          </Button>
        </Link>
      );
    },
  },
];
