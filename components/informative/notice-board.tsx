"use client";

import {
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { notice, tenderTable } from "@/lib/db/schema";

type TabKey = "admission" | "notice" | "tender" | "examination";

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
  const [tab, setTab] = useState<TabKey>("admission");

  // Admission tab — open admissions only
  const admissionItems = openAdmissions.map((a) => ({
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

  // Notice tab — college notices from notice table only
  const noticeItems = (notices || []).map((n) => ({
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

  // Tender tab
  const tenderItems = tenders.map((t) => ({
    title: t.title,
    description: t.description || "",
    date: new Date(t.startDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    rawDate: new Date(t.startDate),
    category: "tender" as const,
    link: t.document,
    isNew:
      new Date(t.startDate) > new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  }));

  // Examination tab — empty for now
  const examinationItems: typeof tenderItems = [];

  const items =
    tab === "admission"
      ? admissionItems
      : tab === "notice"
        ? noticeItems
        : tab === "tender"
          ? tenderItems
          : examinationItems;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "admission",
      label: `Admission${admissionItems.length ? ` (${admissionItems.length})` : ""}`,
      icon: <GraduationCap className="h-3 w-3" />,
    },
    {
      key: "notice",
      label: `Notice${noticeItems.length ? ` (${noticeItems.length})` : ""}`,
      icon: <Bell className="h-3 w-3" />,
    },
    {
      key: "tender",
      label: `Tender${tenders.length ? ` (${tenders.length})` : ""}`,
      icon: <FileText className="h-3 w-3" />,
    },
    {
      key: "examination",
      label: "Examination",
      icon: <Bookmark className="h-3 w-3" />,
    },
  ];

  const isExternal = (href: string) => {
    return (
      href.startsWith("http") ||
      href.endsWith(".pdf") ||
      href.startsWith("/uploads") ||
      href.includes("/tenders/")
    );
  };

  const emptyMessages: Record<TabKey, string> = {
    admission: "No active admission announcements at the moment.",
    notice: "No active notices at the moment.",
    tender: "No active tender publications at the moment.",
    examination: "No active examination notices or links at the moment.",
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "admission":
        return "bg-emerald-50 text-emerald-600";
      case "tender":
        return "bg-purple-50 text-purple-600";
      case "notice":
        return "bg-blue-50 text-blue-600";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "admission":
        return <GraduationCap className="h-3.5 w-3.5" />;
      case "tender":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
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
            type="button"
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${tab === t.key
                ? "bg-blue-900 text-white shadow"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* List — fixed min-height prevents layout shift on tab switch */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[320px] max-h-[320px]">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={i}
              className="px-5 py-3.5 flex gap-3 items-start hover:bg-slate-50/70 transition-colors"
            >
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${getCategoryStyle(item.category)}`}
              >
                {getCategoryIcon(item.category)}
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
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center h-full">
            {emptyMessages[tab]}
          </div>
        )}
      </div>

      {/* View all button for admission tab */}
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
