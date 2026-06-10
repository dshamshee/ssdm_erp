"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AddDepartmentSheet } from "./add-department";
import { ListDepartment } from "./list-department";

export function DepartmentContent() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex w-full flex-col gap-3 px-4 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Department name to search department.."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <AddDepartmentSheet />
      </div>
      <Separator />
      <ListDepartment search={search} />
    </div>
  );
}
