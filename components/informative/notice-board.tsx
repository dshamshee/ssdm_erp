"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  ArrowRight,
  FileText,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import type { tenderTable, notice } from "@/lib/db/schema";

type TabKey = "notice" | "tender" | "examination";

interface OpenAdmission {
  batchId: string;
  courseName: string;
  courseCode: string;
  sessionName: string;
  startDate: string;
  endDate: string;
}

type Tender = typeof tenderTable.$inferSelect;
type Notice = typeof notice.$inferSelect;

export function NoticeBoard({
  openAdmissions,
  tenders,
  notices,
}: {
  openAdmissions: OpenAdmission[];
  tenders: Tender[];
  notices: Notice[];
}) {
  const [tab, setTab] = useState<TabKey>("notice");

  // Notice tab shows admission notices
  const admissionNotices = openAdmissions.map((a) => ({
    title: `Admission Open: ${a.courseName} (${a.sessionName})`,
    description: `Apply before ${new Date(a.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.`,
    date: new Date(a.startDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    rawDate: new Date(a.startDate),
    category: "admission" as const,
    link: `/admission/verify/${a.batchId}`,
    isNew: true,
  }));

  // Notice tab also shows college notices
  const collegeNotices = (notices || []).map((n) => ({
    title: n.title,
    description: n.description || "",
    date: new Date(n.startDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    rawDate: new Date(n.startDate),
    category: "notice" as const,
    link: n.file || "",
    isNew:
      new Date(n.startDate) > new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  }));

  // Combine and sort notices by start date descending
  const combinedNotices = [...admissionNotices, ...collegeNotices].sort(
    (a, b) => b.rawDate.getTime() - a.rawDate.getTime()
  );

  // Tender tab shows tenders
  const tenderNotices = tenders.map((t) => ({
    title: t.title,
    description: t.description || "",
    date: new Date(t.startDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    category: "tender" as const,
    link: t.document,
    isNew:
      new Date(t.startDate) > new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  }));

  // Examination tab is empty for now
  const examinationNotices: any[] = [];

  const items =
    tab === "notice"
      ? combinedNotices
      : tab === "tender"
        ? tenderNotices
        : examinationNotices;

  const tabs: { key: TabKey; label: string }[] = [
    {
      key: "notice",
      label: `Notice${combinedNotices.length ? ` (${combinedNotices.length})` : ""}`,
    },
    {
      key: "tender",
      label: `Tender${tenders.length ? ` (${tenders.length})` : ""}`,
    },
    { key: "examination", label: "Examination" },
  ];

  const isExternal = (href: string) => {
    return (
      href.startsWith("http") ||
      href.endsWith(".pdf") ||
      href.startsWith("/uploads") ||
      href.includes("/tenders/")
    );
  };

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
                    : item.category === "tender"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {item.category === "admission" ? (
                  <Bookmark className="h-3.5 w-3.5" />
                ) : item.category === "tender" ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <Calendar className="h-3 w-3" /> {item.date}
                  {item.isNew && (
                    <span className="bg-red-500 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase animate-pulse">
                      New
                    </span>
                  )}
                </p>
                <div className="space-y-0.5">
                  {isExternal(item.link) ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-800 hover:text-blue-900 leading-snug flex items-center gap-1.5"
                    >
                      {item.title}
                      <ExternalLink className="h-3 w-3 text-slate-400 inline shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href={item.link}
                      className="text-xs font-semibold text-slate-800 hover:text-blue-900 leading-snug block"
                    >
                      {item.title}
                    </Link>
                  )}
                  {item.description && (
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            {tab === "notice" && "No active notices or admission announcements at the moment."}
            {tab === "tender" && "No active tender publications at the moment."}
            {tab === "examination" &&
              "No active examination notices or links at the moment."}
          </div>
        )}
      </div>

      {/* View all button for notices / admissions */}
      {tab === "notice" && openAdmissions.length > 0 && (
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
