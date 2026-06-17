"use client";

import { GraduationCap, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Departments", href: "/#academics" },
  {
    label: "Infrastructure",
    href: "/infrastructure",
    items: [
      { label: "Conference Hall", href: "/infrastructure/conference-hall" },
      { label: "Auditorium", href: "/infrastructure/auditorium" },
      { label: "Laboratories", href: "/infrastructure/laboratories" },
      { label: "Library", href: "/infrastructure/library" },
      { label: "Computer Lab", href: "/infrastructure/computer-lab" },
      { label: "Health Center", href: "/infrastructure/health-center" },
      { label: "Sports Complex", href: "/infrastructure/sports-complex" },
    ],
  },
  {
    label: "Gallery",
    href: "/gallery",
    items: [
      { label: "Photo Gallery", href: "/gallery/photo" },
      { label: "Video Gallery", href: "/gallery/video" },
    ],
  },
  {
    label: "Student Zone",
    href: "/student-zone",
    items: [
      { label: "Holidays", href: "/student-zone/holidays" },
      { label: "Syllabus", href: "/student-zone/syllabus" },
    ],
  },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader({ collegeName }: { collegeName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      {/* Top utility bar */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <span className="hidden sm:inline font-light tracking-wide">
            Affiliated to Patliputra University&ensp;|&ensp;NAAC Accredited
          </span>
          <span className="sm:hidden font-light tracking-wide">
            PPU Affiliated
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> Helpline
            </span>
            <Link href="/auth/signin" className="hover:underline font-medium">
              Student Login
            </Link>
            <Link href="/auth/signin" className="hover:underline font-medium">
              Staff Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="p-2 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <GraduationCap className="h-7 w-7 text-blue-900" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 uppercase leading-tight tracking-tight max-w-[260px]">
                {collegeName}
              </p>
              <p className="text-[9px] text-slate-400 tracking-widest font-medium">
                ESTD. 1990 &bull; BARH, PATNA
              </p>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) =>
              l.items ? (
                <div key={l.label} className="relative group py-4">
                  <button className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-blue-900 transition-colors focus:outline-none cursor-pointer">
                    {l.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 w-56 rounded-xl bg-white border border-slate-100 p-2 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    {l.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-900 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[13px] font-semibold text-slate-600 hover:text-blue-900 transition-colors"
                >
                  {l.label}
                </Link>
              )
            )}
            <Link
              href="/admission"
              className="ml-2 px-5 py-2 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow-md shadow-blue-900/10 transition-all"
            >
              Online Admission
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden text-slate-600"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 max-h-[80vh] overflow-y-auto space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((l) => (
            <div key={l.label} className="space-y-1">
              {l.items ? (
                <>
                  <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                    {l.label}
                  </div>
                  {l.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block pl-6 pr-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              )}
            </div>
          ))}
          <Link
            href="/admission"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 mt-4 rounded-lg bg-blue-900 text-white text-sm font-bold"
          >
            Online Admission
          </Link>
        </nav>
      )}
    </header>
  );
}
