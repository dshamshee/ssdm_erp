"use client";

import { useMemo, useState } from "react";
import { useGetNotices } from "../query/get-notices";
import { AddNoticeSheet } from "./add-notice-sheet";
import { columns } from "./column";
import { DataTable } from "./data-table";

export function NoticeContent() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: records = [], isPending, isError, error } = useGetNotices();

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((record) =>
        record.title.toLowerCase().includes(searchLower),
      );
    }

    if (filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((record) => {
        const start = new Date(record.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(record.endDate);
        end.setHours(0, 0, 0, 0);

        let status = "";
        if (today < start) {
          status = "Upcoming";
        } else if (today > end) {
          status = "Expired";
        } else {
          status = "Active";
        }

        return status === filterStatus;
      });
    }

    return filtered;
  }, [records, search, filterStatus]);

  if (isPending) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Loading notices...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive text-sm">
        Error: {error?.message || "Failed to load notices"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddNoticeSheet />
      </div>
      <DataTable
        columns={columns}
        data={filteredRecords}
        onSearch={setSearch}
        onFilterStatus={setFilterStatus}
        search={search}
        filterStatus={filterStatus}
      />
    </div>
  );
}
