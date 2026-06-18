import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Image from "next/image";
import Link from "next/link";
import { Building, CheckCircle2, ChevronRight, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

interface FacilityData {
  title: string;
  image: string;
  desc: string;
  features: string[];
}

const facilityMap: Record<string, FacilityData> = {
  "conference-hall": {
    title: "Conference Hall",
    image: "/images/infra_conference.png",
    desc: "SSDM College houses a state-of-the-art air-conditioned Conference Hall with a seating capacity of over 150. It is designed to host academic seminars, administrative panel discussions, workshops, and guest lectures.",
    features: [
      "Acoustically treated walls",
      "High-definition projection system",
      "Integrated sound setup and podium mics",
      "Video conferencing capability",
    ],
  },
  auditorium: {
    title: "College Auditorium",
    image: "/images/infra_auditorium.png",
    desc: "A spacious, multi-purpose Auditorium acts as the hub for cultural celebrations, annual day events, student union speeches, and inter-college festivals, supporting standard high-quality sound and stage lighting.",
    features: [
      "Seating capacity of 500+",
      "Professional stage lighting setup",
      "Backstage green rooms",
      "Advanced Dolby surround sound",
    ],
  },
  laboratories: {
    title: "Advanced Science Laboratories",
    image: "/images/infra_laboratories.png",
    desc: "We offer specialized and modern laboratory facilities for Physics, Chemistry, Botany, and Zoology. The labs are equipped with high-grade apparatus, raw chemical compounds, and safety equipment to support practical learning.",
    features: [
      "High-grade microscopes and lab gear",
      "Individual workstation benches",
      "Chemical safety exhausts & fire safety",
      "Trained lab assistants and instructors",
    ],
  },
  library: {
    title: "Central Library",
    image: "/images/infra_library.png",
    desc: "Our spacious library is home to over 15,000 reference books, national/international research journals, newspapers, and academic textbooks, featuring quiet study zones and online cataloging portals.",
    features: [
      "15,000+ reference textbooks",
      "Quiet individual study cubicles",
      "Access to national research journals",
      "E-library portal for catalog search",
    ],
  },
  "computer-lab": {
    title: "Computing & IT Lab",
    image: "/images/infra_computer_lab.png",
    desc: "The college hosts a modern computing center setup with high-speed internet LAN systems, designed for general digital learning, computer literacy classes, and academic research.",
    features: [
      "50+ modern computer terminals",
      "100 Mbps high-speed internet lease line",
      "UPS backup power system",
      "Equipped for digital literacy & academic work",
    ],
  },
  "health-center": {
    title: "Campus Health & Wellness Center",
    image: "/images/infra_health_center.png",
    desc: "SSDM College operates a dedicated primary health center equipped with basic medical facilities, first-aid tools, recovery beds, and on-call medical practitioners to ensure student wellness.",
    features: [
      "First-aid and immediate relief beds",
      "On-call doctors and medical staff",
      "Basic health screening checkups",
      "Safe sanitary and disposal systems",
    ],
  },
  "sports-complex": {
    title: "Sports Complex & Gymnasium",
    image: "/images/infra_sports_complex.png",
    desc: "We believe in physical fitness and sportsmanship. The sports complex provides indoor sports arenas (table tennis, chess, carrom) and outdoor setups (badminton, basketball) along with a fully equipped fitness gym.",
    features: [
      "Indoor games courts (Table Tennis, Carrom)",
      "Outdoor basketball & badminton setup",
      "Hygienic fitness gym with trainer",
      "Annual college athletic meet organization",
    ],
  },
};

const otherFacilities = [
  { label: "Conference Hall", slug: "conference-hall" },
  { label: "Auditorium", slug: "auditorium" },
  { label: "Laboratories", slug: "laboratories" },
  { label: "Library", slug: "library" },
  { label: "Computer Lab", slug: "computer-lab" },
  { label: "Health Center", slug: "health-center" },
  { label: "Sports Complex", slug: "sports-complex" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = facilityMap[slug];

  if (!facility) {
    notFound();
  }

  const config = getCollegeConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow">
        {/* Banner */}
        <section className="bg-[#002b5b] text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-300">
              <Building className="h-3.5 w-3.5" /> Campus Infrastructure
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {facility.title}
            </h1>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Main details */}
            <div className="lg:col-span-8 space-y-8 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <Image
                  src={facility.image}
                  alt={facility.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b pb-2">
                  About the Facility
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">
                  {facility.desc}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b pb-2">
                  Key Features & Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {facility.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 items-start p-3 bg-slate-50 border border-slate-200/40 rounded-xl"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium leading-normal">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar list */}
            <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b">
                  Infrastructure List
                </h3>
                <nav className="flex flex-col gap-1">
                  {otherFacilities.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/infrastructure/${f.slug}`}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                        f.slug === slug
                          ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{f.label}</span>
                      <ChevronRight className="h-4 w-4 opacity-60" />
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center space-y-3">
                <MapPin className="h-8 w-8 text-blue-900 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">
                  Visit SSDM Campus
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Our facilities are located at the main Barh campus, Patna,
                  open for visiting during administrative working hours.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
