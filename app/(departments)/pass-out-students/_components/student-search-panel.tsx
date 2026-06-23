"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { useGetCourses } from "@/app/(departments)/course/query/get-courses";
import { useSearchAdmittedStudents, type SearchFilters } from "../query/search-admitted-students";
import { useMutPromoteToPass } from "../query/mut-promote-to-pass";
import { PassConfirmDialog } from "./pass-confirm-dialog";

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT = {};

export function StudentSearchPanel() {
  const [query, setQuery] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(null);

  // Fetch dropdown data
  const { data: sessions } = useGetAcademicSessions();
  const { data: departments } = useQuery(getDepartment());
  const { data: courses } = useGetCourses();

  // Filter courses based on selected department
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!selectedDepartmentId) return courses;
    return courses.filter((c) => c.departmentId === selectedDepartmentId);
  }, [courses, selectedDepartmentId]);

  // Fetch matching students (only when appliedFilters is not null)
  const { data: students, isPending, isError, error } = useSearchAdmittedStudents(
    appliedFilters ?? EMPTY_OBJECT,
    !!appliedFilters
  );

  // Promote to Pass mutation
  const promoteMutation = useMutPromoteToPass();

  // Reset selected rows when appliedFilters changes
  useEffect(() => {
    setRowSelection({});
  }, [appliedFilters]);

  const handleSearch = useCallback(() => {
    setAppliedFilters({
      query: query.trim() || undefined,
      sessionId: selectedSessionId || undefined,
      courseId: selectedCourseId || undefined,
      departmentId: selectedDepartmentId || undefined,
      semesterCount: selectedSemester ? Number(selectedSemester) : undefined,
      status: selectedStatus || undefined,
    });
  }, [query, selectedSessionId, selectedCourseId, selectedDepartmentId, selectedSemester, selectedStatus]);

  const handlePromoteSelected = useCallback((studentIds: string[]) => {
    promoteMutation.mutate(studentIds, {
      onSuccess: () => {
        setRowSelection({});
      },
    });
  }, [promoteMutation]);

  const handleResetFilters = useCallback(() => {
    setQuery("");
    setSelectedSessionId("");
    setSelectedDepartmentId("");
    setSelectedCourseId("");
    setSelectedSemester("");
    setSelectedStatus("");
    setAppliedFilters(null);
    setRowSelection({});
  }, []);

  // Define columns
  const columns = useMemo(() => {
    return [
      {
        id: "select",
        header: ({ table }: { table: any }) => {
          const someSelected = table.getIsSomePageRowsSelected();
          const allSelected = table.getIsAllPageRowsSelected();
          const hasSelectableRows = table.getRowModel().rows.some((row: any) => row.getCanSelect());

          return (
            <input
              type="checkbox"
              checked={allSelected}
              disabled={!hasSelectableRows}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected && !allSelected;
                }
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="h-4 w-4 rounded border-muted-foreground/30 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
            />
          );
        },
        cell: ({ row }: { row: any }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-muted-foreground/30 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          />
        ),
      },
      {
        accessorKey: "collegeRoll",
        header: "College Roll",
        cell: ({ row }: { row: any }) => (
          <div className="font-mono text-xs">{row.original.collegeRoll}</div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: { row: any }) => (
          <div className="font-medium text-sm">{row.original.name}</div>
        ),
      },
      {
        id: "course",
        header: "Course & Department",
        cell: ({ row }: { row: any }) => (
          <div className="text-xs space-y-0.5">
            <div>{row.original.batch.course.name}</div>
            <div className="text-muted-foreground">{row.original.batch.course.department.name}</div>
          </div>
        ),
      },
      {
        id: "academicDetails",
        header: "Session & Semester",
        cell: ({ row }: { row: any }) => (
          <div className="text-xs space-y-0.5">
            <div>Session: <span className="font-medium">{row.original.batch.academicSession.name}</span></div>
            <div>Sem: <span className="font-semibold">{row.original.currentSemesterCount}</span> / {row.original.batch.course.duration * 2}</div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }: { row: any }) => {
          const { isActive, isDetained, isPassed } = row.original;
          const maxSem = row.original.batch.course.duration * 2;
          const atMaxSem = row.original.currentSemesterCount >= maxSem;

          if (isPassed) {
            return <Badge variant="outline" className="border-blue-500 text-blue-600">Passed</Badge>;
          }
          if (isDetained) {
            return <Badge variant="destructive">Detained</Badge>;
          }
          if (!isActive) {
            return <Badge variant="secondary">Inactive</Badge>;
          }
          if (atMaxSem) {
            return <Badge variant="outline" className="border-amber-500 text-amber-600">Max Semester</Badge>;
          }
          return <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>;
        },
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }: { row: any }) => {
          const isEligible = row.original.currentSemesterCount >= 6 && !row.original.isPassed;

          if (!isEligible) {
            return (
              <Button
                size="sm"
                disabled
                className="bg-muted text-muted-foreground/50 border border-muted-foreground/10 text-xs h-8 px-2 cursor-not-allowed opacity-50"
              >
                🎓 Promote to Pass
              </Button>
            );
          }

          return (
            <PassConfirmDialog
              selectedNames={[row.original.name]}
              isPending={promoteMutation.isPending}
              onConfirm={() => handlePromoteSelected([row.original.id])}
              trigger={
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2"
                >
                  🎓 Promote to Pass
                </Button>
              }
            />
          );
        },
      },
    ];
  }, [promoteMutation.isPending]);

  // Table instance
  const table = useReactTable({
    data: students ?? EMPTY_ARRAY,
    columns,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id,
    enableRowSelection: (row) => row.original.currentSemesterCount >= 6 && !row.original.isPassed,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  // Compute selected eligible students directly from rowSelection state
  const selectedEligibleIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  const selectedEligibleNames = useMemo(() => {
    if (!students) return [];
    return students
      .filter((s) => rowSelection[s.id])
      .map((s) => s.name);
  }, [rowSelection, students]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters grid */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="search-query" className="text-sm font-medium">
            Search Student Details
          </label>
          <Input
            id="search-query"
            placeholder="Search by Name, Roll Number, Phone, Email, UAN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Session select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="session-select" className="text-xs font-medium text-muted-foreground">
              Session
            </label>
            <NativeSelect
              id="session-select"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <NativeSelectOption value="">All Sessions</NativeSelectOption>
              {(sessions ?? []).map((s) => (
                <NativeSelectOption key={s.id} value={s.id}>
                  {s.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Department select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dept-select" className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <NativeSelect
              id="dept-select"
              value={selectedDepartmentId}
              onChange={(e) => {
                setSelectedDepartmentId(e.target.value);
                setSelectedCourseId(""); // Reset course when department changes
              }}
            >
              <NativeSelectOption value="">All Departments</NativeSelectOption>
              {(departments ?? []).map((d) => (
                <NativeSelectOption key={d.id} value={d.id}>
                  {d.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Course select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="course-select" className="text-xs font-medium text-muted-foreground">
              Course
            </label>
            <NativeSelect
              id="course-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <NativeSelectOption value="">All Courses</NativeSelectOption>
              {filteredCourses.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Semester select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sem-select" className="text-xs font-medium text-muted-foreground">
              Semester
            </label>
            <NativeSelect
              id="sem-select"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <NativeSelectOption value="">All Semesters</NativeSelectOption>
              {Array.from({ length: 8 }).map((_, i) => (
                <NativeSelectOption key={i + 1} value={String(i + 1)}>
                  Semester {i + 1}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {/* Status select */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status-select" className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <NativeSelect
              id="status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <NativeSelectOption value="">All Statuses</NativeSelectOption>
              <NativeSelectOption value="active">Active</NativeSelectOption>
              <NativeSelectOption value="detained">Detained</NativeSelectOption>
              <NativeSelectOption value="passed">Passed</NativeSelectOption>
              <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2 border-t border-muted/20">
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Clear Filters
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 px-4 shadow-sm"
            onClick={handleSearch}
          >
            🔍 Search Students
          </Button>
        </div>
      </div>

      {/* Search States / Table Rendering */}
      {appliedFilters === null ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-card/50 backdrop-blur-sm min-h-[300px] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-3xl shadow-inner animate-pulse">
            🔍
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-semibold tracking-tight">Ready to Search</h3>
            <p className="text-sm text-muted-foreground">
              Configure the filters above and click the <strong>Search Students</strong> button to view student records.
            </p>
          </div>
        </div>
      ) : isPending ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card min-h-[300px] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse font-medium">
            Searching and compiling student records...
          </p>
        </div>
      ) : isError ? (
        <div className="text-sm text-destructive p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          Error: {error.message}
        </div>
      ) : students && students.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-card min-h-[300px] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-3xl">
            ⚠️
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-semibold tracking-tight">No Records Found</h3>
            <p className="text-sm text-muted-foreground">
              No students matched your search criteria. Try modifying your filters or search query and search again.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Top Bar for Results & Bulk Graduation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/40 border rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                Search Results ({students?.length || 0} Student{students?.length !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Central Bulk Promotion Button in Top Bar */}
            {selectedEligibleIds.length > 0 ? (
              <div className="flex items-center gap-3 p-1 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  Selected <strong>{selectedEligibleIds.length}</strong> eligible student{selectedEligibleIds.length !== 1 ? "s" : ""}
                </span>
                <PassConfirmDialog
                  selectedNames={selectedEligibleNames}
                  isPending={promoteMutation.isPending}
                  onConfirm={() => handlePromoteSelected(selectedEligibleIds)}
                  trigger={
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3"
                    >
                      🎓 Promote Selected to Pass
                    </Button>
                  }
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                Select checkboxes to perform bulk promotions (Semester ≥ 6 only)
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-b-lg border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="even:bg-muted/10 data-[state=selected]:bg-emerald-500/5 hover:bg-muted/5"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()} — Showing{" "}
              {table.getRowModel().rows.length} of {students.length} students
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
