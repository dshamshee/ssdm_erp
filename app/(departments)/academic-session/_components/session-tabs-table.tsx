"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAcademicSessions } from "../query/get-academic-session";
import { AddSessionDialog } from "./add-session-dialog";
import { type AcademicSessionRow, columns } from "./column";
import { DataTable } from "./data-table";

function CourseBatchDetails({ session }: { session: AcademicSessionRow }) {
  if (!session.batches.length) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        No courses are attached to this session.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Course</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Semesters</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {session.batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.course.name}</TableCell>
              <TableCell>{batch.course.department.name}</TableCell>
              <TableCell>{batch.semesters.length}</TableCell>
              <TableCell>
                <Badge
                  variant={batch.course.isActive ? "default" : "secondary"}
                >
                  {batch.course.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SessionTabsTable() {
  const { data, isPending, isError, error } = useGetAcademicSessions();

  if (isPending) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-sm text-destructive">Error: {error.message}</div>
    );
  }

  const sessions = data ?? [];
  const activeSessions = sessions.filter((session) => session.isActive);
  const depreciatedSessions = sessions.filter((session) => !session.isActive);

  return (
    <Tabs defaultValue="active" className="w-full">
      <div className="flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="depreciated">Depreciated</TabsTrigger>
        </TabsList>
        <AddSessionDialog />
      </div>

      <TabsContent value="active">
        <DataTable
          columns={columns}
          data={activeSessions}
          renderExpandedRow={(session) => (
            <CourseBatchDetails session={session} />
          )}
        />
      </TabsContent>
      <TabsContent value="depreciated">
        <DataTable
          columns={columns}
          data={depreciatedSessions}
          renderExpandedRow={(session) => (
            <CourseBatchDetails session={session} />
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
