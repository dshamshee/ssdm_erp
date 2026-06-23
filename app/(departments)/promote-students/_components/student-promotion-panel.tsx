"use client";

import { useState, useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";
import { useGetAdmittedStudentsBySession } from "@/app/(departments)/promote-students/query/get-admitted-students-by-session";
import { useMutPromoteStudents } from "@/app/(departments)/promote-students/query/mut-promote-students";
import {
  type AdmittedStudentRow,
  promoteColumns,
} from "./promote-columns";
import { PromoteConfirmDialog } from "./promote-confirm-dialog";

export function StudentPromotionPanel() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  // Fetch all sessions for the dropdown
  const {
    data: sessions,
    isPending: isSessionsPending,
    isError: isSessionsError,
    error: sessionsError,
  } = useGetAcademicSessions();

  // Fetch students for the selected session
  const {
    data: students,
    isPending: isStudentsPending,
    isError: isStudentsError,
    error: studentsError,
  } = useGetAdmittedStudentsBySession(selectedSessionId);

  // Promote mutation
  const promoteMutation = useMutPromoteStudents();

  // Compute eligible count
  const { eligibleCount, totalCount } = useMemo(() => {
    if (!students) return { eligibleCount: 0, totalCount: 0 };

    const eligible = students.filter((s) => {
      const maxSem = s.batch.course.duration * 2;
      return (
        s.isActive &&
        !s.isDetained &&
        !s.isPassed &&
        s.currentSemesterCount < maxSem
      );
    });

    return { eligibleCount: eligible.length, totalCount: students.length };
  }, [students]);

  // Selected session name
  const selectedSessionName = useMemo(() => {
    if (!sessions || !selectedSessionId) return "";
    return sessions.find((s) => s.id === selectedSessionId)?.name ?? "";
  }, [sessions, selectedSessionId]);

  // Table with pagination
  const table = useReactTable({
    data: students ?? [],
    columns: promoteColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  function handlePromote() {
    if (selectedSessionId) {
      promoteMutation.mutate(selectedSessionId);
    }
  }

  if (isSessionsPending) {
    return (
      <div className="text-sm text-muted-foreground">Loading sessions...</div>
    );
  }

  if (isSessionsError) {
    return (
      <div className="text-sm text-destructive">
        Error loading sessions: {sessionsError.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with filter and promote button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="session-filter"
            className="text-sm font-medium"
          >
            Filter by Academic Session
          </label>
          <NativeSelect
            id="session-filter"
            value={selectedSessionId ?? ""}
            onChange={(e) =>
              setSelectedSessionId(e.target.value || null)
            }
            className="w-full sm:w-[250px]"
          >
            <NativeSelectOption value="">
              Select a session...
            </NativeSelectOption>
            {(sessions ?? []).map((session) => (
              <NativeSelectOption key={session.id} value={session.id}>
                {session.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {selectedSessionId && students && students.length > 0 && (
          <PromoteConfirmDialog
            sessionName={selectedSessionName}
            eligibleCount={eligibleCount}
            totalCount={totalCount}
            isPending={promoteMutation.isPending}
            onConfirm={handlePromote}
            disabled={!selectedSessionId || eligibleCount === 0}
          />
        )}
      </div>

      {/* Summary cards */}
      {selectedSessionId && students && students.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">
              Eligible for Promotion
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {eligibleCount}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Detained</p>
            <p className="text-2xl font-bold text-red-500">
              {students.filter((s) => s.isDetained).length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground">Passed / Inactive</p>
            <p className="text-2xl font-bold text-blue-500">
              {students.filter((s) => s.isPassed || !s.isActive).length}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedSessionId && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          Select an academic session to view students.
        </div>
      )}

      {/* Loading state */}
      {selectedSessionId && isStudentsPending && (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
          Loading students...
        </div>
      )}

      {/* Error state */}
      {isStudentsError && (
        <div className="text-sm text-destructive">
          Error: {studentsError.message}
        </div>
      )}

      {/* No students found */}
      {selectedSessionId &&
        !isStudentsPending &&
        students &&
        students.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            No admitted students found for this session.
          </div>
        )}

      {/* Student table */}
      {students && students.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md border">
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
                      className="even:bg-muted/20"
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
                      colSpan={promoteColumns.length}
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
