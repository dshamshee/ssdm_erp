"use client";

import {
  Loader2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { ContentLayout } from "@/components/content-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useFeeCollectionReport,
  useFilterOptions,
  useGlobalFeeStats,
} from "../query/use-fee-collection";
import { CollectionTable } from "./collection-table";

type AdmissionDateMode = "all" | "date" | "range";

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function FeeCollectionClient() {
  const todayDate = getDateInputValue(new Date());
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [admissionDateMode, setAdmissionDateMode] =
    useState<AdmissionDateMode>("all");
  const [admissionDate, setAdmissionDate] = useState<string>(todayDate);
  const [admissionDateFrom, setAdmissionDateFrom] = useState<string>(todayDate);
  const [admissionDateTo, setAdmissionDateTo] = useState<string>(todayDate);

  const admissionDateFilter = {
    mode: admissionDateMode,
    admissionDateFrom:
      admissionDateMode === "range"
        ? admissionDateFrom || todayDate
        : admissionDate || todayDate,
    admissionDateTo:
      admissionDateMode === "range"
        ? admissionDateTo || admissionDateFrom || todayDate
        : admissionDate || todayDate,
  };

  const { data: globalStats, isFetching: isFetchingStats } = useGlobalFeeStats(admissionDateFilter);
  const { data: courses, isLoading: isLoadingOptions } = useFilterOptions();

  const isAllCourses = selectedCourseId === "all";
  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);

  const allBatches = isAllCourses
    ? (courses ?? []).flatMap((c) =>
        c.batches.map((b) => ({
          ...b,
          courseName: c.name,
        })),
      )
    : [];

  const totalSemesters = isAllCourses
    ? Math.max(0, ...(courses ?? []).map((c) => c.duration * 2))
    : selectedCourse
      ? selectedCourse.duration * 2
      : 0;
  const semesterOptions = Array.from({ length: totalSemesters }, (_, index) =>
    String(index + 1),
  );

  const { data: reportData, isLoading: isLoadingReport } =
    useFeeCollectionReport(
      selectedBatchId,
      selectedSemester ? parseInt(selectedSemester, 10) : 0,
    );

  return (
    <ContentLayout title="Fee Collection">
      <div className="">
        <div className="mb-4 flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
          <div className="w-full md:w-44">
            <p className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
              Admission View
            </p>
            <Select
              value={admissionDateMode}
              onValueChange={(value) =>
                setAdmissionDateMode(value as AdmissionDateMode)
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="date">Date Wise</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {admissionDateMode === "date" ? (
            <div className="w-full md:w-52">
              <label
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700"
                htmlFor="admission-date"
              >
                Date
              </label>
              <Input
                id="admission-date"
                type="date"
                value={admissionDate}
                onChange={(event) => setAdmissionDate(event.target.value)}
              />
            </div>
          ) : admissionDateMode === "range" ? (
            <>
              <div className="w-full md:w-52">
                <label
                  className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700"
                  htmlFor="admission-date-from"
                >
                  From
                </label>
                <Input
                  id="admission-date-from"
                  type="date"
                  value={admissionDateFrom}
                  onChange={(event) => setAdmissionDateFrom(event.target.value)}
                />
              </div>

              <div className="w-full md:w-52">
                <label
                  className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700"
                  htmlFor="admission-date-to"
                >
                  To
                </label>
                <Input
                  id="admission-date-to"
                  type="date"
                  min={admissionDateFrom}
                  value={admissionDateTo}
                  onChange={(event) => setAdmissionDateTo(event.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {admissionDateMode === "all"
                    ? "Total Students (All Time)"
                    : admissionDateMode === "range"
                    ? "Students In Range"
                    : "Students On Date"}
                </p>
                <div className="flex h-7 items-center">
                  {isFetchingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : (
                    <p className="text-xl font-black text-slate-800">
                      {globalStats?.totalStudents || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
                <UserPlus size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {admissionDateMode === "all"
                    ? "Total Admissions (All Time)"
                    : admissionDateMode === "range"
                    ? "Admissions In Range"
                    : "Admissions On Date"}
                </p>
                <div className="flex h-7 items-center">
                  {isFetchingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : (
                    <p className="text-xl font-black text-slate-800">
                      {globalStats?.periodAdmissions || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {admissionDateMode === "all"
                    ? "Total Collected (All Time)"
                    : admissionDateMode === "range"
                    ? "Collected In Range"
                    : "Collected On Date"}
                </p>
                <div className="flex h-7 items-center">
                  {isFetchingStats ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : (
                    <p className="text-xl font-black text-slate-800">
                      ₹{(globalStats?.totalCollected || 0).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h1 className="text-2xl font-black mb-6 text-slate-800">
          Fee Collection Report
        </h1>

        <Card className="mb-8 border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Course
                </p>
                <Select
                  value={selectedCourseId}
                  onValueChange={(val) => {
                    setSelectedCourseId(val);
                    setSelectedBatchId("");
                    setSelectedSemester("");
                  }}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Course</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Session / Batch
                </p>
                <Select
                  value={selectedBatchId}
                  onValueChange={(val) => {
                    setSelectedBatchId(val);
                    setSelectedSemester("");
                  }}
                  disabled={!selectedCourseId || isLoadingOptions}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAllCourses
                      ? allBatches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.courseName} — {batch.academicSession?.name || "Unknown Session"}
                          </SelectItem>
                        ))
                      : selectedCourse?.batches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.academicSession?.name || "Unknown Session"}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 block uppercase tracking-wide">
                  Semester
                </p>
                <Select
                  value={selectedSemester}
                  onValueChange={setSelectedSemester}
                  disabled={!selectedBatchId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        Semester {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBatchId && selectedSemester && (
          <div className="mt-8">
            {isLoadingReport ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500 font-medium">
                  Loading report data...
                </p>
              </div>
            ) : reportData ? (
              <CollectionTable students={reportData} />
            ) : null}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
