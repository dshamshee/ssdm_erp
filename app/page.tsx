import { db } from "@/lib/db";
import {
  admissionOpenTable,
  batchTable,
  courseTable,
  academicSessionTable,
  tenderTable,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import { NoticeBoard } from "@/components/informative/notice-board";
import { AcademicsSection } from "@/components/informative/academics-section";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Award,
  Users,
  ArrowRight,
  ChevronRight,
  Library,
  FlaskConical,
  Phone,
  Mail,
  MapPin,
  Laptop,
  Building,
  GraduationCap,
} from "lucide-react";

// Server-side data fetching
async function getOpenAdmissions() {
  try {
    const records = await db
      .select({
        batchId: admissionOpenTable.batchId,
        courseName: courseTable.name,
        courseCode: courseTable.code,
        sessionName: academicSessionTable.name,
        startDate: admissionOpenTable.startDate,
        endDate: admissionOpenTable.endDate,
        isDateExtended: admissionOpenTable.isDateExtended,
        extendedDate: admissionOpenTable.extendedDate,
      })
      .from(admissionOpenTable)
      .innerJoin(batchTable, eq(admissionOpenTable.batchId, batchTable.id))
      .innerJoin(courseTable, eq(batchTable.courseId, courseTable.id))
      .innerJoin(
        academicSessionTable,
        eq(batchTable.academicSessionId, academicSessionTable.id),
      )
      .where(eq(batchTable.isActive, true));

    const todayStr = new Date().toISOString().split("T")[0];
    return records.filter((r) => {
      const actualEndDate =
        r.isDateExtended && r.extendedDate ? r.extendedDate : r.endDate;
      return todayStr >= r.startDate && todayStr <= actualEndDate;
    });
  } catch (error) {
    console.error("Error fetching open admissions:", error);
    return [];
  }
}

async function getTenders() {
  try {
    const records = await db
      .select()
      .from(tenderTable)
      .orderBy(desc(tenderTable.startDate));
    return records;
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return [];
  }
}

export default async function Page() {
  const config = getCollegeConfig();
  const openAdmissions = await getOpenAdmissions();
  const tenders = await getTenders();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Banner Section */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/campus-hero.png"
              alt={`${config.name} Campus`}
              fill
              priority
              className="object-cover object-center opacity-40 scale-105 transition-transform duration-[10000ms] hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40" />
            {/* Ambient glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8 animate-in fade-in duration-700">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Award className="h-4 w-4" /> NAAC Accredited & Affiliated to PPU
            </div>

            {/* Title */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tight leading-[1.15] drop-shadow-sm uppercase">
                {config.name}
              </h1>
              <p className="text-base sm:text-lg lg:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
                Empowering women through higher education, fostering academic
                excellence and holistic development.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link
                href="/admission"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-center"
              >
                Apply for Admission 2026-27
              </Link>
              <Link
                href="#about"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm transition-all text-center"
              >
                Explore Campus
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              {[
                {
                  count: "30+",
                  label: "Years of Excellence",
                  icon: <Award className="h-5 w-5 text-blue-400" />,
                },
                {
                  count: "5k+",
                  label: "Enrolled Students",
                  icon: <Users className="h-5 w-5 text-indigo-400" />,
                },
                {
                  count: "10+",
                  label: "Academic Programs",
                  icon: <BookOpen className="h-5 w-5 text-cyan-400" />,
                },
                {
                  count: "15+",
                  label: "Modern Facilities",
                  icon: <Library className="h-5 w-5 text-violet-400" />,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center space-y-1 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-white/5 mb-1">
                    {stat.icon}
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {stat.count}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Notice Board + Quick Links Section */}
        <section
          id="quick-links"
          className="py-20 bg-white border-y border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Notice Board Column (Spans 2 on lg) */}
              <div className="lg:col-span-2">
                <NoticeBoard
                  openAdmissions={openAdmissions}
                  tenders={tenders}
                />
              </div>

              {/* Quick Links Column */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider">
                      Student Desk
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      Quick Actions & Portal Links
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Access critical academic resources, student portals,
                      online forms, and notification updates instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-6">
                    <Link
                      href="/admission"
                      className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-blue-900 rounded-xl transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Online Admission Open
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Enroll for the academic session 2026-2027
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/auth/student/signin"
                      className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-blue-900 rounded-xl transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-violet-50 text-violet-700 group-hover:bg-violet-100 transition-colors">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Student Login
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Access your admission portal and student dashboard
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/auth/admin/signin"
                      className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-blue-900 rounded-xl transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            College Staff Login
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Access departmental ERP and management portal
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm cursor-not-allowed opacity-80">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Results & Marksheets
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Check regular & vocational course results
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Static
                      </span>
                    </div>

                    <div className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm cursor-not-allowed opacity-80">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Syllabus & Curriculum
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Download current course syllabi for PPU
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Static
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About College & Founder Section */}
        <section
          id="about"
          className="py-20 bg-slate-50 relative overflow-hidden"
        >
          {/* Subtle design element */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl -z-10" />
          <div className="absolute left-0 bottom-0 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* About text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider">
                  About the Institution
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                  Nurturing Innovation and Academic Integrity
                </h2>
                <div className="h-1 w-20 bg-blue-900 rounded-full" />
                <p className="text-slate-600 text-sm leading-relaxed">
                  Established with a vision to make quality higher education
                  accessible, <strong>{config.name}</strong> stands as a premier
                  seat of learning in Barh, Patna. Affiliated to Patliputra
                  University, the college has been imparting holistic and
                  value-driven education to women, preparing them to face local
                  and global challenges with confidence and skill.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our curriculum blends rigorous academic standards with
                  state-of-the-art laboratory practices, sports activities, and
                  civic engagement programs like NCC and NSS. We strive to
                  create an inclusive space that respects diversity and fosters
                  creative thinking, critical inquiry, and professional
                  competence.
                </p>
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                      <h4 className="font-bold text-slate-800 text-sm">
                        Our Mission
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mt-1">
                        To deliver state-of-the-art quality education and
                        promote personal empowerment.
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                      <h4 className="font-bold text-slate-800 text-sm">
                        Our Vision
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed mt-1">
                        To become a benchmark institution for women's higher
                        education in Bihar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Principal's message (Spans 5) */}
              <div className="lg:col-span-5">
                <div className="bg-gradient-to-br from-blue-950 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                  {/* Decorative quotes */}
                  <div className="absolute right-6 top-6 text-blue-900/30 font-serif text-8xl pointer-events-none leading-none select-none">
                    “
                  </div>
                  <div className="absolute left-6 bottom-6 text-blue-900/30 font-serif text-8xl pointer-events-none leading-none select-none">
                    ”
                  </div>

                  <div className="space-y-6 relative z-10">
                    <h3 className="text-lg font-bold text-blue-300 tracking-wide uppercase">
                      Principal's Desk
                    </h3>
                    <p className="text-slate-300 text-xs italic leading-relaxed font-light">
                      "Education is the most powerful weapon which you can use
                      to change the world. At our college, we don't just teach
                      curricula; we shape character, build resilience, and
                      ignite minds to think beyond boundaries. I welcome you all
                      to this transformative educational journey."
                    </p>
                    <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center font-bold text-xs text-white uppercase shadow-inner">
                        PS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Prof. Shweta Sinha
                        </p>
                        <p className="text-[10px] text-blue-300">
                          Principal, SSDM College
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academics / Departments Section */}
        <section
          id="academics"
          className="py-20 bg-white border-y border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider">
                Academics
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                Explore Departments & Programs
              </h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Choose from our diverse streams of Arts, Science, and Commerce
                designed to prepare you for modern career opportunities.
              </p>
            </div>

            <AcademicsSection />
          </div>
        </section>

        {/* College Facilities Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider">
                Infrastructure
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                Campus Amenities & Facilities
              </h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                We provide state-of-the-art facilities to create an ideal
                environment for studying, researching, and extracurricular
                development.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Central Library",
                  desc: "A vast repository of reference manuals, research journals, and digitised learning resources accessible to all students.",
                  icon: <Library className="h-6 w-6 text-blue-700" />,
                },
                {
                  title: "Advanced Science Labs",
                  desc: "Equipped with state-of-the-art instruments for physics, chemistry, and biology research and experiment work.",
                  icon: <FlaskConical className="h-6 w-6 text-indigo-700" />,
                },
                {
                  title: "Computer Lab & Wi-Fi",
                  desc: "Modern computing hardware setup with high-speed internet connections for technical training, BCA, and digital learning.",
                  icon: <Laptop className="h-6 w-6 text-cyan-700" />,
                },
                {
                  title: "NCC & NSS Wings",
                  desc: "Active wings for civic training, leadership building, community service, national integrity, and social wellness.",
                  icon: <Award className="h-6 w-6 text-violet-700" />,
                },
                {
                  title: "Placement & Counseling Cell",
                  desc: "Guidance office helping students choose careers, build resumes, prepare for interviews, and secure college placements.",
                  icon: <Users className="h-6 w-6 text-emerald-700" />,
                },
                {
                  title: "Sports Complex & Cafeteria",
                  desc: "Indoor & outdoor sports areas along with a hygienic cafeteria offering wholesome nutritious meals at pocket-friendly prices.",
                  icon: <Building className="h-6 w-6 text-amber-700" />,
                },
              ].map((facility, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group space-y-4"
                >
                  <div className="p-3 bg-slate-50 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
                    {facility.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-900 transition-colors">
                    {facility.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {facility.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section
          id="contact"
          className="py-20 bg-white border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold uppercase tracking-wider">
                Reach Us
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                Contact Our Administration
              </h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Have any inquiries about admission schedules, fees, courses, or
                events? Get in touch with our help desk.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Info grid */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Campus Location
                  </h3>
                  <p className="text-xs text-slate-500">
                    SSDM College is located in Barh, Patna, easily accessible by
                    public transportation.
                  </p>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-xs">
                    <div className="p-2 bg-white rounded-lg text-blue-900 border border-slate-200">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Address</p>
                      <p className="text-slate-500 mt-0.5">
                        {config.address}, {config.city}, {config.state} –{" "}
                        {config.pincode}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-xs">
                    <div className="p-2 bg-white rounded-lg text-blue-900 border border-slate-200">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Helpline Phone</p>
                      <a
                        href={`tel:${config.phone}`}
                        className="text-slate-500 hover:text-blue-900 mt-0.5 block"
                      >
                        {config.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-xs">
                    <div className="p-2 bg-white rounded-lg text-blue-900 border border-slate-200">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Official Email</p>
                      <a
                        href={`mailto:${config.email}`}
                        className="text-slate-500 hover:text-blue-900 mt-0.5 block break-all"
                      >
                        {config.email}
                      </a>
                    </div>
                  </li>
                </ul>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Working Hours: Monday to Saturday — 10:00 AM to 4:00 PM
                    (except gazetted university holidays).
                  </p>
                </div>
              </div>

              {/* Map Directions */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-sm">
                  <MapPin className="h-10 w-10 text-blue-900 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-sm">
                    Map Directions
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed mt-2">
                    Our campus is located in close proximity to the Barh Railway
                    Station. Use the address provided to navigate on Google Maps
                    or contact our support team.
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${config.name}, ${config.address}, ${config.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 mt-4"
                  >
                    Open in Google Maps <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
