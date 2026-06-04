"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { DepartmentCoursesSheet } from "./department-courses-sheet";

export const DetailsCard = ({ id, name }: { id: string; name: string }) => {
  const [open, setOpen] = useState(false);
  const subject = name.trim();

  return (
    <>
      <Card
        size="sm"
        className="w-full cursor-pointer transition-colors hover:bg-muted/60"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        <CardHeader>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Department of
            </span>
            <span className="text-base font-semibold tracking-wide uppercase text-foreground">
              {subject}
            </span>
          </div>
        </CardHeader>
      </Card>

      <DepartmentCoursesSheet
        open={open}
        onOpenChange={setOpen}
        departmentId={id}
        departmentName={subject}
      />
    </>
  );
};
