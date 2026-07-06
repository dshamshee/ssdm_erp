"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBook,
  IconCheck,
  IconLoader2,
  IconLock,
  IconMapPin,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeStudentProfile } from "../lib/action";
import {
  completeProfileSchema,
  type CompleteProfileSchema,
} from "../lib/zod-type";

interface StudentProfileData {
  id: string;
  UAN: string;
  name: string;
  fathersName: string;
  collegeRoll: string;
  registrationNumber: string | null;
  universityRoll: string | null;
  currentSemesterCount: number;
  DOB: string;
  AadharNumber: string;
  phone: string;
  gender: string;
  mothersName: string;
  religion: string;
  caste: string;
  reservation: string | null;
  isMinority: boolean;
  ABCID: string | null;
  admissionType: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  subMIC: string;
  subMDC: string;
  subAEC: string;
  subSEC: string;
  subVAC: string;
}

interface CompleteProfileFormProps {
  student: StudentProfileData;
  subjects: { id: string; name: string; code: string }[];
}

export function CompleteProfileForm({ student, subjects }: CompleteProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompleteProfileSchema>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      DOB: student.DOB || "",
      AadharNumber: student.AadharNumber || "",
      phone: student.phone || "",
      personalEmail: (student as any).personalEmail || "",
      gender: (student.gender as CompleteProfileSchema["gender"]) || undefined,
      mothersName: student.mothersName || "",
      religion: (student.religion as CompleteProfileSchema["religion"]) || undefined,
      caste: (student.caste as CompleteProfileSchema["caste"]) || undefined,
      reservation: student.reservation || "",
      isMinority: student.isMinority || false,
      ABCID: student.ABCID || "",
      admissionType:
        (student.admissionType as CompleteProfileSchema["admissionType"]) ||
        "",
      city: student.city || "",
      district: student.district || "",
      state: student.state || "",
      pinCode: student.pinCode || "",
      subMIC: student.subMIC || "",
      subMDC: student.subMDC || "",
      subAEC: student.subAEC || "",
      subSEC: student.subSEC || "",
      subVAC: student.subVAC || "",
    },
  });

  const onSubmit = async (data: CompleteProfileSchema) => {
    setIsSubmitting(true);
    try {
      const result = await completeStudentProfile(data);
      if (result.success) {
        toast.success("Profile completed successfully!");
        window.location.href = "/student/dashboard";
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Read-only Student Info */}
      <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <IconLock className="h-4 w-4 text-muted-foreground" />
          Pre-filled Information (Read Only)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReadOnlyField label="UAN" value={student.UAN} />
          <ReadOnlyField label="Student Name" value={student.name} />
          <ReadOnlyField label="Father's Name" value={student.fathersName} />
          <ReadOnlyField label="College Roll" value={student.collegeRoll} />
          <ReadOnlyField
            label="Registration No."
            value={student.registrationNumber || "N/A"}
          />
          <ReadOnlyField
            label="University Roll"
            value={student.universityRoll || "N/A"}
          />
          <ReadOnlyField
            label="Current Semester"
            value={`Semester ${student.currentSemesterCount}`}
          />
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <IconUser className="h-4 w-4 text-primary" />
          Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FormField
            label="Date of Birth"
            error={form.formState.errors.DOB?.message}
          >
            <Input
              type="date"
              {...form.register("DOB")}
              className="w-full"
            />
          </FormField>

          <FormField
            label="Aadhar Number"
            error={form.formState.errors.AadharNumber?.message}
          >
            <Input
              type="text"
              maxLength={12}
              placeholder="Enter 12-digit Aadhar number"
              {...form.register("AadharNumber")}
            />
          </FormField>

          <FormField
            label="Phone Number"
            error={form.formState.errors.phone?.message}
          >
            <Input
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit phone number"
              {...form.register("phone")}
            />
          </FormField>

          <FormField
            label="Personal Email (Optional)"
            error={form.formState.errors.personalEmail?.message}
          >
            <Input
              type="email"
              placeholder="your.email@example.com"
              {...form.register("personalEmail")}
            />
          </FormField>

          <FormField
            label="Gender"
            error={form.formState.errors.gender?.message}
          >
            <Select
              value={form.watch("gender") || ""}
              onValueChange={(val) =>
                form.setValue("gender", val as CompleteProfileSchema["gender"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Transgender">Transgender</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Mother's Name"
            error={form.formState.errors.mothersName?.message}
          >
            <Input
              type="text"
              placeholder="Enter mother's full name"
              {...form.register("mothersName")}
            />
          </FormField>

          <FormField
            label="Religion"
            error={form.formState.errors.religion?.message}
          >
            <Select
              value={form.watch("religion") || ""}
              onValueChange={(val) =>
                form.setValue("religion", val as CompleteProfileSchema["religion"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Religion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hindu">Hindu</SelectItem>
                <SelectItem value="Muslim">Muslim</SelectItem>
                <SelectItem value="Christian">Christian</SelectItem>
                <SelectItem value="Sikh">Sikh</SelectItem>
                <SelectItem value="Buddhist">Buddhist</SelectItem>
                <SelectItem value="Jain">Jain</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Caste"
            error={form.formState.errors.caste?.message}
          >
            <Select
              value={form.watch("caste") || ""}
              onValueChange={(val) =>
                form.setValue("caste", val as CompleteProfileSchema["caste"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select caste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GEN">General</SelectItem>
                <SelectItem value="BC">BC</SelectItem>
                <SelectItem value="EBC">EBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Reservation (Optional)"
            error={form.formState.errors.reservation?.message}
          >
            <Input
              type="text"
              placeholder="e.g. EWS, PH"
              {...form.register("reservation")}
            />
          </FormField>

          <FormField
            label="ABC ID (Optional)"
            error={form.formState.errors.ABCID?.message}
          >
            <Input
              type="text"
              placeholder="Academic Bank of Credits ID"
              {...form.register("ABCID")}
            />
          </FormField>

          <FormField
            label="Admission Type (Optional)"
            error={form.formState.errors.admissionType?.message}
          >
            <Select
              value={form.watch("admissionType") || ""}
              onValueChange={(val) =>
                form.setValue(
                  "admissionType",
                  val as CompleteProfileSchema["admissionType"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MERIT">Merit</SelectItem>
                <SelectItem value="SPORT">Sport</SelectItem>
                <SelectItem value="MANAGEMENT QUOTA">
                  Management Quota
                </SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="isMinority"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              {...form.register("isMinority")}
            />
            <Label
              htmlFor="isMinority"
              className="text-sm font-semibold text-foreground cursor-pointer"
            >
              Belongs to Minority
            </Label>
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <IconBook className="h-4 w-4 text-primary" />
          Academic Subject Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FormField
            label="Minor Subject (MIC)"
            error={form.formState.errors.subMIC?.message}
          >
            <Select
              value={form.watch("subMIC") || ""}
              onValueChange={(val) =>
                form.setValue("subMIC", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Minor Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Multidisciplinary Course (MDC)"
            error={form.formState.errors.subMDC?.message}
          >
            <Select
              value={form.watch("subMDC") || ""}
              onValueChange={(val) =>
                form.setValue("subMDC", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Multidisciplinary Course" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Ability Enhancement Course (AEC)"
            error={form.formState.errors.subAEC?.message}
          >
            <Select
              value={form.watch("subAEC") || ""}
              onValueChange={(val) =>
                form.setValue("subAEC", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Ability Enhancement Course" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Skill Enhancement Course (SEC)"
            error={form.formState.errors.subSEC?.message}
          >
            <Select
              value={form.watch("subSEC") || ""}
              onValueChange={(val) =>
                form.setValue("subSEC", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Skill Enhancement Course" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Value Added Course (VAC)"
            error={form.formState.errors.subVAC?.message}
          >
            <Select
              value={form.watch("subVAC") || ""}
              onValueChange={(val) =>
                form.setValue("subVAC", val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Value Added Course" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Address Details */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <IconMapPin className="h-4 w-4 text-primary" />
          Address Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FormField
            label="City"
            error={form.formState.errors.city?.message}
          >
            <Input
              type="text"
              placeholder="Enter city"
              {...form.register("city")}
            />
          </FormField>

          <FormField
            label="District"
            error={form.formState.errors.district?.message}
          >
            <Input
              type="text"
              placeholder="Enter district"
              {...form.register("district")}
            />
          </FormField>

          <FormField
            label="State"
            error={form.formState.errors.state?.message}
          >
            <Input
              type="text"
              placeholder="Enter state"
              {...form.register("state")}
            />
          </FormField>

          <FormField
            label="Pin Code"
            error={form.formState.errors.pinCode?.message}
          >
            <Input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit pin code"
              {...form.register("pinCode")}
            />
          </FormField>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6">
        <p className="text-xs text-muted-foreground max-w-lg">
          <strong>Important:</strong> Please verify all information carefully
          before submitting. This is a one-time action — your profile details
          will be locked after submission.
        </p>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[200px] h-12 text-sm font-black shadow-lg"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
              Saving Profile...
            </>
          ) : (
            <>
              <IconCheck className="h-4 w-4 mr-2" />
              Complete Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-foreground font-bold text-sm mt-0.5 block font-mono">
        {value}
      </span>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-foreground">{label}</Label>
      {children}
      {error && (
        <p className="text-[11px] text-destructive font-semibold">{error}</p>
      )}
    </div>
  );
}
