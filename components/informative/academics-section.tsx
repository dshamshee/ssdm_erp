"use client";

import { useState } from "react";
import {
  Atom,
  Palette,
  BarChart3,
  FlaskConical,
  Calculator,
  Monitor,
  Briefcase,
  BookOpen,
  Pencil,
  Globe,
} from "lucide-react";
import type { ReactNode } from "react";

type StreamKey = "science" | "arts" | "commerce";

interface Dept {
  name: string;
  icon: ReactNode;
  courses: string[];
}

const streams: Record<
  StreamKey,
  { label: string; color: string; activeColor: string; departments: Dept[] }
> = {
  science: {
    label: "Science",
    color: "text-blue-600",
    activeColor: "bg-blue-900 text-white",
    departments: [
      {
        name: "Physics",
        icon: <Atom className="h-5 w-5" />,
        courses: ["B.Sc (Hons) Physics"],
      },
      {
        name: "Chemistry",
        icon: <FlaskConical className="h-5 w-5" />,
        courses: ["B.Sc (Hons) Chemistry"],
      },
      {
        name: "Mathematics",
        icon: <Calculator className="h-5 w-5" />,
        courses: ["B.Sc (Hons) Mathematics"],
      },
      {
        name: "Computer Applications",
        icon: <Monitor className="h-5 w-5" />,
        courses: ["BCA", "PGDCA"],
      },
    ],
  },
  arts: {
    label: "Arts",
    color: "text-violet-600",
    activeColor: "bg-violet-900 text-white",
    departments: [
      {
        name: "Hindi",
        icon: <Pencil className="h-5 w-5" />,
        courses: ["B.A (Hons) Hindi"],
      },
      {
        name: "English",
        icon: <Globe className="h-5 w-5" />,
        courses: ["B.A (Hons) English"],
      },
      {
        name: "History",
        icon: <BookOpen className="h-5 w-5" />,
        courses: ["B.A (Hons) History"],
      },
      {
        name: "Political Science",
        icon: <Palette className="h-5 w-5" />,
        courses: ["B.A (Hons) Political Science"],
      },
    ],
  },
  commerce: {
    label: "Commerce",
    color: "text-emerald-600",
    activeColor: "bg-emerald-900 text-white",
    departments: [
      {
        name: "Commerce",
        icon: <Briefcase className="h-5 w-5" />,
        courses: ["B.Com (Hons)"],
      },
      {
        name: "Business Administration",
        icon: <BarChart3 className="h-5 w-5" />,
        courses: ["BBA (Vocational)"],
      },
    ],
  },
};

export function AcademicsSection() {
  const [active, setActive] = useState<StreamKey>("science");
  const stream = streams[active];

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {(Object.keys(streams) as StreamKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              active === key
                ? streams[key].activeColor + " shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {streams[key].label} Stream
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {stream.departments.map((dept) => (
          <div
            key={dept.name}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group space-y-4"
          >
            <div
              className={`p-3 rounded-xl w-fit ${
                active === "science"
                  ? "bg-blue-50 text-blue-800"
                  : active === "arts"
                    ? "bg-violet-50 text-violet-800"
                    : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {dept.icon}
            </div>
            <h4 className="font-bold text-sm text-slate-800">{dept.name}</h4>
            <ul className="space-y-1">
              {dept.courses.map((c) => (
                <li
                  key={c}
                  className="text-xs text-slate-500 flex items-center gap-1.5"
                >
                  <span className="h-1 w-1 bg-slate-300 rounded-full" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
