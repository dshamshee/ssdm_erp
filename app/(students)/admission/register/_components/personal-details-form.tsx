'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StudentDataType } from '../lib/zod-type/student-data'
import { Controller, type UseFormReturn } from "react-hook-form"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
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
  Upload
} from "lucide-react"

export const PersonalDetailsForm = ({ form }: { form: UseFormReturn<StudentDataType> }) => {
  const batch = useSearchParams().get('batch')
  const UAN = useSearchParams().get('uan')
  const MJC = useSearchParams().get('mjc')

  const { data, isLoading, error } = useQuery({
    ...getEnrolledStudent({ batch: batch!, UAN: UAN!, MJC: MJC! }),
    enabled: !!batch && !!UAN && !!MJC,
  });

  const [avatarFileName, setAvatarFileName] = useState<string>("")

  useEffect(() => {
    if (data) {
      form.reset({
        ...form.getValues(),
        UAN: data.UAN || "",
        name: data.name || "",
        gender: (data.gender as any) || "",
        batch: data.batchId || "",
        subMJC: data.subMJC?.id || (data.subMJC as any) || "",
        subMIC: data.subMIC ? data.subMIC.map((s: any) => typeof s === 'string' ? s : s.id) : [],
        subMDC: data.subMDC ? data.subMDC.map((s: any) => typeof s === 'string' ? s : s.id) : [],
        subSEC: data.subSEC ? data.subSEC.map((s: any) => typeof s === 'string' ? s : s.id) : [],
        subVAC: data.subVAC ? data.subVAC.map((s: any) => typeof s === 'string' ? s : s.id) : [],
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
    )
  }

  if (error || (batch && UAN && MJC && !data)) {
    return (
      <Card className="shadow-lg border-destructive/20 bg-destructive/5">
        <CardContent className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-destructive">Failed to Load Student Record</h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {error?.message || "Verify your admission link containing batch, UAN, and MJC values."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* 1. Pre-fetched Information Banner */}
      {data && (
        <Card className="overflow-hidden border border-primary/10 shadow-md bg-gradient-to-br from-primary/5 via-transparent to-chart-3/5">
          <CardHeader className="border-b border-primary/5 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <CardTitle className="font-bold text-lg text-primary">Pre-fetched Enrollment Info</CardTitle>
            </div>
            <CardDescription>Verified information from your academic enrollment record.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Student Name</span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {data.name}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Unique Admission Number (UAN)</span>
                <span className="text-base font-bold text-foreground font-mono">
                  {data.UAN}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Gender</span>
                <span className="text-base font-bold text-foreground">
                  {data.gender}
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Academic Session & Course</span>
                <span className="text-base font-bold text-foreground">
                  {data.batch?.course?.name || "N/A"} ({data.batch?.academicSession?.name || "N/A"})
                </span>
              </div>
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs col-span-1 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Major Subject (MJC)</span>
                <span className="text-base font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {data.subMJC?.name || data.subMJC}
                </span>
              </div>

              {data.subMIC && data.subMIC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Minor Subject (MIC)</span>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Multidisciplinary Course (MDC)</span>
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

              {data.subSEC && data.subSEC.length > 0 && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 shadow-xs">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Skill Enhancement Course (SEC)</span>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Value Added Course (VAC)</span>
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
                These details are auto-verified from your enrollment record. If you spot any mistakes, please complete the form and contact administration after registration.
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
            <CardTitle className="font-semibold text-xl">Further Personal Details</CardTitle>
          </div>
          <CardDescription>Provide additional personal information required for college registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Father's Name */}
            <Controller
              control={form.control}
              name="fathersName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel requiredLable>Father&apos;s Name</FieldLabel>
                  <FieldContent>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Father's full name" />
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
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Mother's full name" />
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
                      aria-invalid={fieldState.invalid} 
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
                      aria-invalid={fieldState.invalid} 
                      placeholder="12-digit number" 
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Religion */}
            <Controller
              control={form.control}
              name="religion"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel requiredLable>Religion</FieldLabel>
                  <FieldContent>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Ex: Hindu, Islam, Christian" />
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
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Ex: General, OBC, SC, ST" />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Merit Type */}
            <Controller
              control={form.control}
              name="meritType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Merit Selection Type</FieldLabel>
                  <FieldContent>
                    <select
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm cursor-pointer"
                    >
                      <option value="Other">Other (Default)</option>
                      <option value="1st">1st Merit</option>
                      <option value="2nd">2nd Merit</option>
                      <option value="3rd">3rd Merit</option>
                      <option value="Sports Merit">Sports Merit</option>
                      <option value="Tribe Reserved">Tribe Reserved</option>
                    </select>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Admission No */}
            <Controller
              control={form.control}
              name="admissionNo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Admission No. (Optional)</FieldLabel>
                  <FieldContent>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Enter Admission Number" />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Confidential No */}
            <Controller
              control={form.control}
              name="confidentialNo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Confidential No. (Optional)</FieldLabel>
                  <FieldContent>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Enter Confidential Number" />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Profile No */}
            <Controller
              control={form.control}
              name="profileNo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Profile No. (Optional)</FieldLabel>
                  <FieldContent>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Enter Profile Number" />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Avatar Photo Upload */}
            <Controller
              control={form.control}
              name="avatar"
              render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Profile Photo (Avatar)</FieldLabel>
                  <FieldContent>
                    <div className="flex flex-col gap-2">
                      <div className="relative flex items-center justify-center border border-dashed border-input rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors p-4 cursor-pointer min-h-[5rem]">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              setAvatarFileName(file.name);
                              console.log("Avatar selected:", file);
                            }
                          }}
                          {...fieldProps}
                        />
                        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground pointer-events-none">
                          <Upload className="h-5 w-5 text-muted-foreground animate-bounce" />
                          <span className="font-semibold text-primary">Choose avatar file</span>
                          <span>PNG, JPG or WEBP up to 5MB</span>
                        </div>
                      </div>
                      {avatarFileName && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-2 py-1 rounded-md w-fit">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="font-medium truncate max-w-[180px]">{avatarFileName}</span>
                        </div>
                      )}
                    </div>
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
                <Field data-invalid={fieldState.invalid} className="flex flex-row items-center justify-between p-4 bg-muted/20 border border-input/30 rounded-2xl">
                  <div className="space-y-0.5">
                    <FieldLabel className="text-sm font-semibold cursor-pointer">Belong to Minority Community?</FieldLabel>
                    <span className="text-xs text-muted-foreground block">Toggle if you are a minority candidate</span>
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
        </CardContent>
      </Card>
    </div>
  )
}