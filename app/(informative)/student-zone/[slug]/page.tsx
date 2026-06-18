"use client";

import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Link from "next/link";
import { use } from "react";
import {
  Calendar,
  BookOpen,
  ChevronRight,
  Download,
  Clock,
} from "lucide-react";
import { notFound } from "next/navigation";

// Holiday Data
const holidays = [
  { sNo: 1, occasion: "New Year's Day", date: "Jan 01, 2026", day: "Thursday" },
  { sNo: 2, occasion: "Makar Sankranti", date: "Jan 14, 2026", day: "Wednesday" },
  { sNo: 3, occasion: "Republic Day", date: "Jan 26, 2026", day: "Monday" },
  { sNo: 4, occasion: "Vasant Panchami", date: "Jan 28, 2026", day: "Wednesday" },
  { sNo: 5, occasion: "Maha Shivratri", date: "Feb 15, 2026", day: "Sunday" },
  { sNo: 6, occasion: "Holi Festival", date: "Mar 05, 2026", day: "Thursday" },
  { sNo: 7, occasion: "Eid-ul-Fitr", date: "Mar 20, 2026", day: "Friday" },
  { sNo: 8, occasion: "Ram Navami", date: "Apr 05, 2026", day: "Sunday" },
  { sNo: 9, occasion: "Ambedkar Jayanti", date: "Apr 14, 2026", day: "Tuesday" },
  { sNo: 10, occasion: "Summer Vacation", date: "Jun 01 - Jun 20", day: "Mon - Sat" },
  { sNo: 11, occasion: "Independence Day", date: "Aug 15, 2026", day: "Saturday" },
  { sNo: 12, occasion: "Durga Puja", date: "Oct 18 - Oct 22", day: "Sun - Thu" },
  { sNo: 13, occasion: "Diwali & Chhath Puja", date: "Nov 08 - Nov 14", day: "Sun - Sat" },
  { sNo: 14, occasion: "Christmas Day", date: "Dec 25, 2026", day: "Friday" },
];

// Syllabus Data
const syllabiList = [
  { stream: "Science", name: "B.Sc Physics Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BSc_Physics_Syllabus.pdf" },
  { stream: "Science", name: "B.Sc Chemistry Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BSc_Chemistry_Syllabus.pdf" },
  { stream: "Science", name: "B.Sc Mathematics Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BSc_Mathematics_Syllabus.pdf" },
  { stream: "Arts", name: "B.A English Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BA_English_Syllabus.pdf" },
  { stream: "Arts", name: "B.A Economics Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BA_Economics_Syllabus.pdf" },
  { stream: "Arts", name: "B.A History Honours Syllabus (CBCS)", updated: "2026-27", file: "PPU_BA_History_Syllabus.pdf" },
];

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (
    slug !== "holidays" &&
    slug !== "syllabus"
  ) {
    notFound();
  }

  const menuItems = [
    { label: "Holiday Calendar", slug: "holidays", icon: <Calendar className="h-4 w-4" /> },
    { label: "Course Syllabus", slug: "syllabus", icon: <BookOpen className="h-4 w-4" /> },
  ];

  const config = {
    name: "SANT SANDHYA DAS MAHILA COLLEGE",
    email: "ssdm@gmail.com",
    phone: "XXXXXXXXXX",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow">
        {/* Banner */}
        <section className="bg-[#002b5b] text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-300">
              {slug === "holidays" && <Calendar className="h-3.5 w-3.5" />}
              {slug === "syllabus" && <BookOpen className="h-3.5 w-3.5" />}{" "}
              Student Zone
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight capitalize">
              {slug === "holidays" && "Holiday Calendar"}
              {slug === "syllabus" && "Course Syllabus"}
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Dynamic Content Area */}
            <div className="lg:col-span-9 space-y-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* HOLIDAYS CONTENT */}
              {slug === "holidays" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                      Academic Year Holidays
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Standard list of official leaves, festivals, and breaks
                      scheduled for the current academic session.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="p-4 text-center w-16">S.No.</th>
                          <th className="p-4">Occasion / Festival</th>
                          <th className="p-4">Scheduled Date</th>
                          <th className="p-4">Day</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holidays.map((h, i) => (
                          <tr
                              key={i}
                              className="border-b border-slate-100 hover:bg-slate-50/50 text-slate-600 font-medium transition-colors last:border-0"
                            >
                              <td className="p-4 text-center">{h.sNo}</td>
                              <td className="p-4 text-slate-800 font-bold">
                                {h.occasion}
                              </td>
                              <td className="p-4 text-blue-900 font-semibold">
                                {h.date}
                              </td>
                              <td className="p-4">{h.day}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SYLLABUS CONTENT */}
              {slug === "syllabus" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                      Course Syllabus Catalogue
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Find details about course structures, semester marks
                      distribution, major and minor syllabus guidelines for
                      PPU CBCS.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {syllabiList.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 border border-slate-200/60 rounded-2xl gap-4 group hover:border-blue-900 transition-all"
                      >
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center text-[9px] font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {item.stream} Stream
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-slate-400">
                            Academic Syllabus Session: {item.updated}
                          </p>
                        </div>
                        <button
                          onClick={() => alert(`Downloading Syllabus: ${item.file}`)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-blue-900 hover:bg-blue-900 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 font-bold text-xs"
                        >
                          <Download className="h-4 w-4" /> Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b">
                  Student Navigation
                </h3>
                <nav className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/student-zone/${item.slug}`}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                        item.slug === slug
                          ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon} {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-3">
                <Clock className="h-8 w-8 text-blue-900 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Exam Forms</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Make sure to verify exam submission deadlines and clear all pending dues before exams begin.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter config={config as any} />
    </div>
  );
}
