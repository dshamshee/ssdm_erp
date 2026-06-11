"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-between items-center bg-slate-950 text-white px-6 py-4 print:hidden shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider">Admission Form Print Preview</span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.close()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          Close Tab
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
        >
          <Printer className="h-4 w-4" /> Print Form
        </button>
      </div>
    </div>
  );
}
