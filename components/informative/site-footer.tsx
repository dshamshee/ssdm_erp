import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import type { CollegeConfig } from "@/lib/college-config";

export function SiteFooter({ config }: { config: CollegeConfig }) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/40 rounded-xl">
                <GraduationCap className="h-5 w-5 text-blue-400" />
              </div>
              <span className="font-bold text-white text-sm uppercase tracking-wide">
                {config.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Committed to quality higher education under Patliputra University.
              Nurturing future leaders through knowledge, values, and skills.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Home", href: "/" },
                { label: "About College", href: "/#about" },
                { label: "Departments", href: "/#academics" },
                { label: "Online Admission", href: "/admission" },
                { label: "Contact Us", href: "/#contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Zone */}
          <div>
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase mb-4">
              Student Zone
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Online Admission", href: "/admission" },
                { label: "Fee Payment", href: "#" },
                { label: "Examination", href: "#" },
                { label: "Syllabus", href: "#" },
                { label: "Time Table", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-white tracking-widest uppercase mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  {config.address}, {config.city},<br />
                  {config.state} – {config.pincode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-blue-400">
                  {config.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <a
                  href={`mailto:${config.email}`}
                  className="hover:text-blue-400 break-all"
                >
                  {config.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-[10px] text-slate-500 space-y-1.5">
          <p>
            © {new Date().getFullYear()} {config.name}. All Rights Reserved.
          </p>
          <p>Affiliated to Patliputra University, Patna.</p>
          <p className="text-slate-600">
            Developed & Managed by{" "}
            <a
              href="https://vaastman.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 font-medium hover:underline hover:text-blue-400 transition-colors"
            >
              Vastaman Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
