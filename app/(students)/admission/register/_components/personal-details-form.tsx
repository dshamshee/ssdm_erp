"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StudentDataType } from "../lib/zod-type/student-data";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getEnrolledStudent } from "../query/get-enrolled-student";
import { useEffect, useState } from "react";
import {
  User,
  Calendar,
  CreditCard,
  FolderHeart,
  ShieldAlert,
  BookOpen,
  Users,
  Sparkles,
  Info,
  CheckCircle2,
  Upload,
} from "lucide-react";

export const PersonalDetailsForm = ({
  form,
}: {
  form: UseFormReturn<StudentDataType>;
}) => {
  const batch = useSearchParams().get("batch");
  const UAN = useSearchParams().get("uan");
  const MJC = useSearchParams().get("mjc");

  const { data, isLoading, error } = useQuery({
    ...getEnrolledStudent({ batch: batch!, UAN: UAN!, MJC: MJC! }),
    enabled: !!batch && !!UAN && !!MJC,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...form.getValues(),
        UAN: data.UAN || "",
        registrationNumber: data.registrationNumber || "",
        universityRoll: data.universityRoll || "",
        admissionNumber: "",
        confidentialNumber: "",
        profileNumber: "",
        admissionType: (data.admissionType as any) || "OTHER",
        ABCID: data.ABCID || "",
        name: data.name || "",
        DOB: data.DOB || "",
        AadharNumber: data.aadharNumber || "",
        phone: data.phone || "",
        email: data.email || "",
        gender: (data.gender as any) || "",
        fathersName: data.fathersName || "",
        mothersName: data.mothersName || "",
        caste: data.caste || "",
        reservation: data.reservation || "",
        batch: data.batchId || "",
        subMJC: data.subMJC?.id || (data.subMJC as any) || "",
        subMIC: data.subMIC
          ? data.subMIC.map((s: any) => (typeof s === "string" ? s : s.id))
          : [],
        subMDC: data.subMDC
          ? data.subMDC.map((s: any) => (typeof s === "string" ? s : s.id))
          : [],
        subAEC: data.subAEC
          ? data.subAEC.map((s: any) => (typeof s === "string" ? s : s.id))
          : [],
        subSEC: data.subSEC
          ? data.subSEC.map((s: any) => (typeof s === "string" ? s : s.id))
          : [],
        subVAC: data.subVAC
          ? data.subVAC.map((s: any) => (typeof s === "string" ? s : s.id))
          : [],
      });
    }
  }, [data, form]);

  if (isLoading) {
    return (
      <Card className="shadow-lg border-primary/20">
        <CardContent className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Fetching student enrollment details...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || (batch && UAN && MJC && !data)) {
    return (
      <Card className="shadow-lg border-destructive/20 bg-destructive/5">
        <CardContent className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-destructive">
              Failed to Load Student Record
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {error?.message ||
                "Verify your admission link containing batch, UAN, and MJC values."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Pre-fetched Information Banner */}
      {data && (
        <Card className="overflow-hidden border border-primary/10 shadow-md bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5">
          <CardHeader className="border-b border-primary/5 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle className="font-bold text-lg text-primary">
                Pre-fetched Enrollment Info
              </CardTitle>
            </div>
            <CardDescription>
              Verified information from your academic enrollment record.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Student Name
                </span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {data.name}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Unique Admission Number (UAN)
                </span>
                <span className="text-base font-bold text-foreground font-mono">
                  {data.UAN}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Gender
                </span>
                <span className="text-base font-bold text-foreground">
                  {data.gender}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Academic Session & Course
                </span>
                <span className="text-base font-bold text-foreground">
                  {data.batch?.course?.name || "N/A"} (
                  {data.batch?.academicSession?.name || "N/A"})
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs col-span-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Major Subject (MJC)
                </span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {data.subMJC?.name || data.subMJC}
                </span>
              </div>

              {data.subMIC && data.subMIC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Minor Subject (MIC)
                  </span>
                  <span className="text-base font-bold text-foreground flex flex-col gap-1">
                    {data.subMIC.map((sub: any) => (
                      <span key={sub.id} className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {sub.name || sub}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {data.subMDC && data.subMDC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Multidisciplinary Course (MDC)
                  </span>
                  <span className="text-base font-bold text-foreground flex flex-col gap-1">
                    {data.subMDC.map((sub: any) => (
                      <span key={sub.id} className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {sub.name || sub}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {data.subAEC && data.subAEC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Ability Enhancement Course (AEC)
                  </span>
                  <span className="text-base font-bold text-foreground flex flex-col gap-1">
                    {data.subAEC.map((sub: any) => (
                      <span key={sub.id} className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {sub.name || sub}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {data.subSEC && data.subSEC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Skill Enhancement Course (SEC)
                  </span>
                  <span className="text-base font-bold text-foreground flex flex-col gap-1">
                    {data.subSEC.map((sub: any) => (
                      <span key={sub.id} className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {sub.name || sub}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {data.subVAC && data.subVAC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Value Added Course (VAC)
                  </span>
                  <span className="text-base font-bold text-foreground flex flex-col gap-1">
                    {data.subVAC.map((sub: any) => (
                      <span key={sub.id} className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {sub.name || sub}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/10">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                These details are auto-verified from your enrollment record. If
                you spot any mistakes, please complete the form and contact
                administration after registration.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Personal Information Fields */}
      <Card className="border border-muted-foreground/10 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-chart-4" />
            <CardTitle className="font-semibold text-xl">
              Further Personal Details
            </CardTitle>
          </div>
          <CardDescription>
            Provide additional personal information required for college
            registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          {/* Group A: Pre-filled/Imported Enrollment Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-foreground">
                Imported Enrollment Details (Editable)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              These details are pre-filled from your enrollment file. Please
              review and update if necessary. Highlighted fields are fetched
              from your enrollment record.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {/* Student Name */}
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Student Name</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Full Name"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Gender */}
              <Controller
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Gender</FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-4xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 px-3 py-1 text-base transition-colors outline-none focus-visible:border-emerald-500 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Date of Birth */}
              <Controller
                control={form.control}
                name="DOB"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Date of Birth</FieldLabel>
                    <FieldContent>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Father's Name */}
              <Controller
                control={form.control}
                name="fathersName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Father&apos;s Name</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Father's full name"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Mother's Name */}
              <Controller
                control={form.control}
                name="mothersName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Mother&apos;s Name</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Mother's full name"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Aadhar Number */}
              <Controller
                control={form.control}
                name="AadharNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Aadhar Number</FieldLabel>
                    <FieldContent>
                      <Input
                        maxLength={12}
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="12-digit number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Phone Number */}
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Phone Number</FieldLabel>
                    <FieldContent>
                      <Input
                        maxLength={10}
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="10-digit mobile number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Email Address */}
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Email Address</FieldLabel>
                    <FieldContent>
                      <Input
                        type="email"
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="student@example.com"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Caste */}
              <Controller
                control={form.control}
                name="caste"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Caste</FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-4xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 px-3 py-1 text-base transition-colors outline-none focus-visible:border-emerald-500 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
                      >
                        <option value="">Select Caste</option>
                        <option value="GEN">GEN (General)</option>
                        <option value="BC">BC (Backward Class)</option>
                        <option value="EBC">
                          EBC (Extremely Backward Class)
                        </option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Reservation */}
              <Controller
                control={form.control}
                name="reservation"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Reservation Category (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Ex: PH, Sports, Defence"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Admission Type */}
              <Controller
                control={form.control}
                name="admissionType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Admission Type</FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-4xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 px-3 py-1 text-base transition-colors outline-none focus-visible:border-emerald-500 focus-visible:ring-[3px] focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
                      >
                        <option value="OTHER">OTHER (Default)</option>
                        <option value="MERIT">MERIT</option>
                        <option value="SPORT">SPORT</option>
                        <option value="MANAGEMENT QUOTA">
                          MANAGEMENT QUOTA
                        </option>
                      </select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* ABC ID */}
              <Controller
                control={form.control}
                name="ABCID"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>
                      Academic Bank of Credits ID (ABC ID)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Enter ABC ID"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Registration Number */}
              <Controller
                control={form.control}
                name="registrationNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Registration Number</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                        placeholder="Enter Registration Number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* University Roll */}
              {data?.universityRoll && (
                <Controller
                  control={form.control}
                  name="universityRoll"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>University Roll Number</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          className="bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                          placeholder="Enter University Roll Number"
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              )}
            </div>
          </div>

          {/* Group B: Additional Registration Details (Manual Entry) */}
          <div className="space-y-6 pt-6 border-t border-muted-foreground/10">
            <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-base font-bold text-foreground">
                Additional Admission Details (Manual Entry)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please provide the following additional details required to
              finalize college admission. These fields are not in your
              enrollment record and must be manually input.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {/* Religion */}
              <Controller
                control={form.control}
                name="religion"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>Religion</FieldLabel>
                    <FieldContent>
                      <select
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        className="h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
                      >
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Islam">Islam</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Jain">Jain</option>
                        <option value="Other">Other</option>
                      </select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* City */}
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>City</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter City"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* District */}
              <Controller
                control={form.control}
                name="district"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>District</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter District"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* State */}
              <Controller
                control={form.control}
                name="state"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>State</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter State"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* PIN Code */}
              <Controller
                control={form.control}
                name="pinCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel requiredLable>PIN Code</FieldLabel>
                    <FieldContent>
                      <Input
                        maxLength={6}
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="6-digit PIN Code"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Admission Number */}
              <Controller
                control={form.control}
                name="admissionNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Admission No. (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Admission Number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Confidential Number */}
              <Controller
                control={form.control}
                name="confidentialNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Confidential No. (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Confidential Number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Profile Number */}
              <Controller
                control={form.control}
                name="profileNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Profile No. (Optional)</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter Profile Number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Minority Status */}
              <Controller
                control={form.control}
                name="isMinority"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="flex flex-row items-center justify-between p-4 bg-muted/20 border border-input/30 rounded-2xl"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel className="text-sm font-semibold cursor-pointer">
                        Belong to Minority Community?
                      </FieldLabel>
                      <span className="text-xs text-muted-foreground block">
                        Toggle if you are a minority candidate
                      </span>
                    </div>
                    <FieldContent className="flex-none gap-0 leading-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!!field.value}
                        onClick={() => field.onChange(!field.value)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          field.value ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                            field.value ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
