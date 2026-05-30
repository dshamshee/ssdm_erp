"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditSessionDialog } from "./edit-session-dialog";

export type AcademicSessionRow = NonNullable<
  ReturnType<typeof useGetAcademicSessions>["data"]
>[number];

export const columns: ColumnDef<AcademicSessionRow>[] = [
  {
    accessorKey: "name",
    header: "Session Name",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <div>{format(row.original.startDate, "PPP")}</div>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <div>{format(row.original.endDate, "PPP")}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Depreciated"}
        </Badge>
      );
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => <EditSessionDialog session={row.original} />,
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      return (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={row.getToggleExpandedHandler()}
          aria-label={row.getIsExpanded() ? "Hide details" : "Show details"}
        >
          {row.getIsExpanded() ? (
            <ChevronDown data-icon="inline-start" />
          ) : (
            <ChevronRight data-icon="inline-start" />
          )}
        </Button>
      );
    },
  },
];
