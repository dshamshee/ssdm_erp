"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "../query/get-all-department";
import { DetailsCard } from "./details-carad";

interface ListDepartmentProps {
  search?: string;
}

export function ListDepartment({ search = "" }: ListDepartmentProps) {
  const { data, isLoading, error } = useQuery(getDepartment());
  const normalizedSearch = search.trim().toLowerCase();

  const filteredDepartments = useMemo(() => {
    if (!data) {
      return [];
    }
    if (!normalizedSearch) {
      return data;
    }
    return data.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [data, normalizedSearch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!filteredDepartments.length) {
    return <div>No department found</div>;
  }
  return (
    <>
      {/* <h1>Department List</h1> */}
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((item) => (
          // <li key={item.id}>{item.name}</li>
          <DetailsCard key={item.id} id={item.id} name={item.name} />
        ))}
      </ul>
    </>
  );
}
