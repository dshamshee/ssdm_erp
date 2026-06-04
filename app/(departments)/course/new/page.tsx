"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
  BookOpenIcon,
  CalendarIcon,
  CheckCircleIcon,
  CoinsIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { buildSemesterLabels } from "@/app/(departments)/course/lib/semester";
import { Step1CourseIdentity } from "./_components/step-1-identity";
import { Step2Session } from "./_components/step-2-session";
import { Step3Subjects } from "./_components/step-3-subjects";
import { Step4Fees } from "./_components/step-4-fees";
import { useCreateCourseWizard } from "./query/mut-create-course-wizard";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Course", icon: GraduationCapIcon },
  { id: 2, label: "Session", icon: CalendarIcon },
  { id: 3, label: "Subjects", icon: BookOpenIcon },
  { id: 4, label: "Fees", icon: CoinsIcon },
] as const;

const defaultFeeRow = {
  institution: 0,
  university: 0,
  practical: 0,
  cultural: 0,
  sports: 0,
  miscellaneous: 0,
  late: 0,
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"new" | "existing">("new");
  const createWizard = useCreateCourseWizard();

  const form = useForm({
    defaultValues: {
      identity: {
        mode: "new" as "new" | "existing",
        name: "",
        code: "",
        type: "UG Regular",
        description: "",
        departmentId: "",
        duration: 4,
        courseId: "",
      },
      session: { sessionId: "" },
      subjects: { sameForAll: true, assignments: { "0": [] } },
      fees: { sameForAll: true, fees: { "0": { ...defaultFeeRow } } },
    },
  });

  const durationWatch = useWatch({ control: form.control, name: "identity.duration" });
  const semesterLabels = useMemo(
    () => buildSemesterLabels(Number(durationWatch) || 0),
    [durationWatch],
  );

  const handleModeChange = (m: "new" | "existing") => {
    setMode(m);
    form.setValue("identity.mode", m);
    form.clearErrors();
  };

  const validateStep = async (s: number) => {
    if (s === 1) {
      if (mode === "existing") {
        return form.trigger("identity.courseId");
      }
      return form.trigger([
        "identity.name",
        "identity.code",
        "identity.type",
        "identity.description",
        "identity.departmentId",
        "identity.duration",
      ] as never[]);
    }
    if (s === 2) return form.trigger("session.sessionId");
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        identity:
          mode === "existing"
            ? { mode: "existing" as const, courseId: values.identity.courseId }
            : {
                mode: "new" as const,
                name: values.identity.name,
                code: values.identity.code,
                type: values.identity.type as never,
                description: values.identity.description,
                departmentId: values.identity.departmentId,
                duration: Number(values.identity.duration),
              },
        session: values.session,
        subjects: values.subjects,
        fees: values.fees,
      };

      const result = await createWizard.mutateAsync(payload);
      router.push(`/batch/${result.courseId}`);
    } catch (_err) {
    }
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create Course</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new course with its batch, subjects, and fee structure.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, idx) => {
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-muted/40 text-muted-foreground",
                  )}
                >
                  {isDone ? (
                    <CheckCircleIcon className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mb-5 h-px flex-1 transition-colors",
                    step > s.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Step content */}
      <form onSubmit={onSubmit}>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {step === 1 && (
            <Step1CourseIdentity
              form={form}
              mode={mode}
              onModeChange={handleModeChange}
            />
          )}
          {step === 2 && (
            <Step2Session form={form} semesterLabels={semesterLabels} />
          )}
          {step === 3 && (
            <Step3Subjects form={form} semesterLabels={semesterLabels} />
          )}
          {step === 4 && (
            <Step4Fees form={form} semesterLabels={semesterLabels} />
          )}
        </div>

        {/* Error from mutation */}
        {createWizard.error && (
          <p className="mt-3 text-sm text-destructive">
            {createWizard.error.message}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Step {step} of {STEPS.length}
            </span>
            {step < STEPS.length ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createWizard.isPending}
              >
                {createWizard.isPending ? "Creating…" : "Create Course"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
