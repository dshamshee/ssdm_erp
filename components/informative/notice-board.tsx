"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  ArrowRight,
  FileText,
  Bookmark,
  Clock,
} from "lucide-react";

type TabKey = "notice" | "admission" | "examination";

interface OpenAdmission {
  batchId: string;
  courseName: string;
  courseCode: string;
  sessionName: string;
  startDate: string;
  endDate: string;
}

// Static placeholder notices
const staticNotices = [
  {
    title: "Revised Academic Calendar 2025-2026 published",
    date: "05 Jun 2026",
    category: "notice" as const,
  },
  {
    title: "NCC / NSS Enrollment Drive 2026-27 — Register Now",
    date: "01 Jun 2026",
    category: "notice" as const,
  },
  {
    title:
      "National Seminar on Innovation in Higher Education — Call for Papers",
    date: "24 May 2026",
    category: "notice" as const,
  },
];

const staticExam = [
  {
    title: "Semester-II Exam Form Fill-up — Last Date Extended",
    date: "08 Jun 2026",
    category: "examination" as const,
  },
  {
    title: "B.Sc (Hons) Sem-IV Practical Exam Schedule Released",
    date: "02 Jun 2026",
    category: "examination" as const,
  },
  {
    title: "Scrutiny Results for B.A. Semester-IV Published",
    date: "28 May 2026",
    category: "examination" as const,
  },
];

export function NoticeBoard({
  openAdmissions,
}: {
  openAdmissions: OpenAdmission[];
}) {
  const [tab, setTab] = useState<TabKey>("notice");

  const admissionNotices = openAdmissions.map((a) => ({
    title: `Admission open: ${a.courseName} (${a.sessionName}) — Apply before ${new Date(a.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    category: "admission" as const,
    link: `/admission/verify/${a.batchId}`,
    isNew: true,
  }));

  const items =
    tab === "notice"
      ? staticNotices
      : tab === "examination"
        ? staticExam
        : admissionNotices;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "notice", label: "Notice" },
    {
      key: "admission",
      label: `Admission${openAdmissions.length ? ` (${openAdmissions.length})` : ""}`,
    },
    { key: "examination", label: "Examination" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-300" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Notice Board
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/60 px-3 py-1.5 gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
              tab === t.key
                ? "bg-blue-900 text-white shadow"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px]">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={i}
              className="px-5 py-3.5 flex gap-3 items-start hover:bg-slate-50/70 transition-colors"
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  item.category === "admission"
                    ? "bg-emerald-50 text-emerald-600"
                    : item.category === "examination"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.category === "admission" ? (
                  <Bookmark className="h-3.5 w-3.5" />
                ) : item.category === "examination" ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <p className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <Calendar className="h-3 w-3" /> {item.date}
                  {"isNew" in item && item.isNew && (
                    <span className="bg-red-500 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                      New
                    </span>
                  )}
                </p>
                {"link" in item ? (
                  <Link
                    href={item.link as string}
                    className="text-xs font-semibold text-slate-800 hover:text-blue-900 leading-snug block"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {item.title}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">
            No updates in this category.
          </div>
        )}
      </div>

      {/* View all */}
      {tab === "admission" && openAdmissions.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50">
          <Link
            href="/admission"
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1"
          >
            View All Open Admissions <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
