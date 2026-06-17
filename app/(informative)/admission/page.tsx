import { db } from "@/lib/db";
import {
  admissionOpenTable,
  batchTable,
  courseTable,
  academicSessionTable,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCollegeConfig } from "@/lib/college-config";
import { SiteHeader } from "@/components/informative/site-header";
import { SiteFooter } from "@/components/informative/site-footer";
import Link from "next/link";
import {
  Calendar,
  IndianRupee,
  ArrowRight,
  Clock,
  ShieldAlert,
} from "lucide-react";

// Force dynamic rendering — data depends on current date and admin mutations
export const dynamic = "force-dynamic";

async function getOpenAdmissions() {
  try {
    const records = await db
      .select({
        id: admissionOpenTable.id,
        batchId: admissionOpenTable.batchId,
        startDate: admissionOpenTable.startDate,
        endDate: admissionOpenTable.endDate,
        lateFee: admissionOpenTable.lateFee,
        isDateExtended: admissionOpenTable.isDateExtended,
        extendedDate: admissionOpenTable.extendedDate,
        perSemesterFee: batchTable.perSemesterFee,
        courseName: courseTable.name,
        courseCode: courseTable.code,
        courseType: courseTable.type,
        sessionName: academicSessionTable.name,
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

export default async function AdmissionPortalPage() {
  const config = getCollegeConfig();
  const admissions = await getOpenAdmissions();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      <SiteHeader collegeName={config.name} />

      <main className="flex-grow py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              Admission Portal
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              Online Admissions 2026-2027
            </h1>
            <p className="text-slate-500 text-xs leading-relaxed">
              Find open admissions for undergraduate regular and vocational
              courses. Complete verification and pay the semester admission fee
              online.
            </p>
          </div>

          {/* Guidelines / Important Alerts */}
          <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-6 max-w-4xl mx-auto space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-800" /> Key Registration
              Steps
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1">
              <li>
                Keep your University Registration/UAN details and major subject
                selection ready.
              </li>
              <li>
                Verify student details with exact major course mapping to fetch
                academic database records.
              </li>
              <li>
                Proceed with checking personal profile data and submit fee
                details online.
              </li>
              <li>
                Retrieve the final confirmation receipt after successful fee
                gateway verification.
              </li>
            </ul>
          </div>

          {/* Admission Cards Grid */}
          <div className="max-w-4xl mx-auto">
            {admissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {admissions.map((ad) => {
                  const displayEndDate =
                    ad.isDateExtended && ad.extendedDate
                      ? ad.extendedDate
                      : ad.endDate;

                  return (
                    <div
                      key={ad.id}
                      className="bg-white border border-slate-200 hover:border-blue-900/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                            {ad.courseType}
                          </span>
                          {ad.isDateExtended && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                              Date Extended
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 transition-colors uppercase leading-snug">
                            {ad.courseName}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">
                            Session: {ad.sessionName}
                          </p>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs text-slate-600 pt-2">
                          <div className="flex justify-between py-2.5">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> Start Date
                            </span>
                            <span className="font-semibold">
                              {formatDate(ad.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2.5">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" /> Apply Before
                            </span>
                            <span className="font-semibold text-slate-800">
                              {formatDate(displayEndDate)}
                            </span>
                          </div>


                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          href={`/admission/verify/${ad.batchId}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 shadow shadow-blue-900/10 hover:shadow-md transition-all"
                        >
                          Apply Online{" "}
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">
                  No Open Admissions
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Currently, online registration or admission forms are not
                  open. Please consult the notice board on our home page or
                  check back later.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-700"
                >
                  Return to Homepage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter config={config} />
    </div>
  );
}
