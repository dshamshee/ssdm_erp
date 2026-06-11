"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap, Phone } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Departments", href: "/#academics" },
  { label: "Student Zone", href: "/#quick-links" },
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
            <Link href="/auth" className="hover:underline font-medium">
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
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] font-semibold text-slate-600 hover:text-blue-900 transition-colors"
              >
                {l.label}
              </Link>
            ))}
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
        <nav className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admission"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 mt-2 rounded-lg bg-blue-900 text-white text-sm font-bold"
          >
            Online Admission
          </Link>
        </nav>
      )}
    </header>
  );
}
