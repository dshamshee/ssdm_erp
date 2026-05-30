"use client";

import { useState, useMemo } from "react";
import { useGetSubjects } from "../query/get-subjects";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { AddSubjectSheet } from "./add-subject-sheet";

export function SubjectsContent() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  // Only fetch all subjects once, then filter client-side
  const { data: subjects = [], isPending, isError, error } = useGetSubjects();

  const filteredSubjects = useMemo(() => {
    let filtered = subjects;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (subject) =>
          subject.name.toLowerCase().includes(searchLower) ||
          subject.code.toLowerCase().includes(searchLower),
      );
    }

    if (filterType) {
      filtered = filtered.filter((subject) => subject.type === filterType);
    }

    return filtered;
  }, [subjects, search, filterType]);

  if (isPending) {
    return <div className="text-center py-8">Loading subjects...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error: {error?.message || "Failed to load subjects"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddSubjectSheet />
      </div>
      <DataTable
        columns={columns}
        data={filteredSubjects}
        onSearch={setSearch}
        onFilterType={setFilterType}
        search={search}
        filterType={filterType}
      />
    </div>
  );
}
