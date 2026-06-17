"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteNoticeDialog } from "./delete-notice-dialog";
import { type NoticeRow, EditNoticeSheet } from "./edit-notice-sheet";

export const columns: ColumnDef<NoticeRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-0.5 max-w-[300px]">
          <span className="font-semibold text-foreground truncate">
            {row.original.title}
          </span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground truncate">
              {row.original.description}
            </span>
          )}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const start = new Date(row.original.startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(row.original.endDate);
      end.setHours(0, 0, 0, 0);

      if (today < start) {
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            Upcoming
          </Badge>
        );
      } else if (today > end) {
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            Expired
          </Badge>
        );
      } else {
        return (
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            Active
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "file",
    header: "File",
    cell: ({ row }) => {
      return row.original.file ? (
        <a
          href={row.original.file}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          View PDF
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">No File</span>
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
          <EditNoticeSheet record={record} />
          <DeleteNoticeDialog id={record.id} title={record.title} />
        </div>
      );
    },
  },
];
