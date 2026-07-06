import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building,
  Check,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Laptop,
  Library,
  Mail,
  MapPin,
  Phone,
  Quote,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AcademicsSection } from "@/components/informative/academics-section";
import { NoticeBoard } from "@/components/informative/notice-board";
import { SiteFooter } from "@/components/informative/site-footer";
import { SiteHeader } from "@/components/informative/site-header";
import { getCollegeConfig } from "@/lib/college-config";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  admissionOpenTable,
  batchTable,
  courseTable,
  notice,
  tenderTable,
} from "@/lib/db/schema";

// Force dynamic rendering — data depends on current date and admin mutations
export const dynamic = "force-dynamic";

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

async function getNotices() {
  try {
    const records = await db
      .select()
      .from(notice)
      .orderBy(desc(notice.startDate));
    return records;
  } catch (error) {
    console.error("Error fetching notices:", error);
    return [];
  }
}

export default async function Page() {
  const config = getCollegeConfig();
  const openAdmissions = await getOpenAdmissions();
  const tenders = await getTenders();
  const notices = await getNotices();

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
              <Award className="h-4 w-4" /> Affiliated to Patliputra University
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
                  notices={notices}
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

                    <Link
                      href="/auth/signin"
                      className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-blue-900 rounded-xl transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-orange-50 text-orange-700 group-hover:bg-orange-100 transition-colors">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Admission for Sem-VII
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Login for semester VII admission process
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

              {/* Why Choose Us Section (Spans 5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
                  <GraduationCap className="h-6 w-6 text-blue-900" />
                  <h3 className="text-xl font-bold text-blue-900">
                    Why Choose Us?
                  </h3>
                </div>
                <div className="space-y-5">
                  {[
                    {
                      title: "Academic Excellence",
                      desc: "High-quality education across diverse streams.",
                    },
                    {
                      title: "Modern Infrastructure",
                      desc: "Fully equipped science labs and a central library.",
                    },
                    {
                      title: "Holistic Development",
                      desc: "Encouraging sports, cultural events, NCC, and NSS.",
                    },
                    {
                      title: "Women Empowerment",
                      desc: "Dedicated to building independent and confident leaders.",
                    },
                    {
                      title: "Student-Centric Approach",
                      desc: "Mentorship, guidance, and active support cells.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-950 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs md:text-sm group-hover:text-blue-900 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principal's Message Section */}
        <section className="w-full py-16 px-4 md:px-8 flex justify-center bg-white border-y border-slate-200">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Principal's photo */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative group max-w-[280px] w-full">
                <div className="aspect-[3/4] bg-slate-200 rounded-[2rem] overflow-hidden shadow-xl border-8 border-white relative z-10">
                  <Image
                    src="/images/principal.jpeg"
                    alt="Prof. Kaushal Kishor Singh"
                    width={300}
                    height={400}
                    priority
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full bg-blue-900 rounded-[2rem] -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500" />
              </div>
            </div>

            {/* Principal's Message text */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="space-y-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-900">
                  Leadership Message
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                  Principal's Message
                </h2>
                <div className="h-1 w-20 bg-blue-900 rounded-full" />
              </div>

              <div className="relative text-slate-600 leading-relaxed text-sm md:text-base space-y-4">
                <Quote className="absolute -top-6 -left-6 text-blue-100/40 h-16 w-16 -z-10 pointer-events-none select-none" />
                <p className="font-semibold text-slate-800 italic text-base md:text-lg">
                  "Dear Students, Faculty, and Visitors,"
                </p>
                <p className="text-justify">
                  It gives me immense pleasure to welcome you to {config.name},
                  an institution dedicated to nurturing talent, fostering
                  innovation, and shaping responsible citizens. Education, in
                  our view, is not merely the acquisition of knowledge but the
                  cultivation of values, discipline, and a spirit of inquiry
                  that prepares individuals for life's challenges.
                </p>
                <p className="text-justify font-light">
                  At our college, we strive to create an environment where
                  academic excellence goes hand in hand with holistic
                  development. Our dedicated faculty, modern infrastructure, and
                  student-centric approach ensure that every learner receives
                  the guidance needed to excel and become an empowered leader of
                  tomorrow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-4 border-t border-slate-200">
                <div>
                  <p className="font-bold text-slate-800 text-base">
                    Prof. Kaushal Kishor Singh
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Principal, {config.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mentors Section */}
        <section className="w-full py-16 px-4 md:px-8 flex justify-center bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl w-full flex flex-col items-center justify-center">
            {/* Header with lines */}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-12 w-full max-w-5xl">
              <hr className="flex-grow border-t-2 border-blue-900/10" />
              <h2 className="text-2xl md:text-3xl text-blue-900 font-bold whitespace-nowrap tracking-tight uppercase">
                Our Mentors
              </h2>
              <hr className="flex-grow border-t-2 border-blue-900/10" />
            </div>

            {/* Mentors grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl justify-items-center">
              {/* Mentor 1: Governor */}
              <div className="group w-full max-w-sm h-auto pb-6 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src="/images/governer.jpeg"
                    alt="Lt Gen Syed Ata Hasnain (Retd.)"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-4 pt-6 flex-grow">
                  <h3 className="text-center text-sm md:text-base font-bold text-slate-800 leading-tight">
                    Lt Gen Syed Ata Hasnain (Retd.)
                  </h3>
                  <p className="text-center text-[10px] md:text-xs font-semibold text-blue-905 text-blue-700 uppercase tracking-wider mt-3 px-2">
                    Hon'ble Chancellor-cum-Governor of Bihar
                  </p>
                </div>
              </div>

              {/* Mentor 2: CM/Deputy CM */}
              <div className="group w-full max-w-sm h-auto pb-6 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src="/images/cm.jpeg"
                    alt="Shri Samrat Chaudhary"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-4 pt-6 flex-grow">
                  <h3 className="text-center text-sm md:text-base font-bold text-slate-800 leading-tight">
                    Shri Samrat Chaudhary
                  </h3>
                  <p className="text-center text-[10px] md:text-xs font-semibold text-blue-705 text-blue-700 uppercase tracking-wider mt-3 px-2">
                    Hon'ble Chief Minister, Bihar
                  </p>
                </div>
              </div>

              {/* Mentor 3: VC */}
              <div className="group w-full max-w-sm h-auto pb-6 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src="/images/vc.jpeg"
                    alt="Prof. Upendra Prasad Singh"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-4 pt-6 flex-grow">
                  <h3 className="text-center text-sm md:text-base font-bold text-slate-800 leading-tight">
                    Prof. Upendra Prasad Singh
                  </h3>
                  <p className="text-center text-[10px] md:text-xs font-semibold text-blue-705 text-blue-700 uppercase tracking-wider mt-3 px-2">
                    Hon'ble Vice Chancellor, Patliputra University
                  </p>
                </div>
              </div>

              {/* Mentor 4: Principal */}
              <div className="group w-full max-w-sm h-auto pb-6 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <Image
                    src="/images/principal.jpeg"
                    alt="Prof. Kaushal Kishor Singh"
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
                <div className="flex flex-col items-center justify-center p-4 pt-6 flex-grow">
                  <h3 className="text-center text-sm md:text-base font-bold text-slate-800 leading-tight">
                    Prof. Kaushal Kishor Singh
                  </h3>
                  <p className="text-center text-[10px] md:text-xs font-semibold text-blue-705 text-blue-700 uppercase tracking-wider mt-3 px-2">
                    Principal, {config.name}
                  </p>
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
