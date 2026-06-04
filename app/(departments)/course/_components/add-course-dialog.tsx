"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  addCourseSchema,
  COURSE_DURATIONS,
  COURSE_TYPES,
  type AddCourseSchema,
} from "../lib/zod-type/add-course-type";
import { buildSemesterLabels } from "../lib/semester";
import { useAddCourse } from "../query/mut-add-course";
import { getDepartment } from "@/app/(departments)/department/query/get-all-department";
import { useQuery } from "@tanstack/react-query";
import { useGetAcademicSessions } from "@/app/(departments)/academic-session/query/get-academic-session";

const STEP_FIELDS: Record<number, Array<keyof AddCourseSchema>> = {
  1: [
    "name",
    "code",
    "type",
    "description",
    "departmentId",
    "duration",
  ],
  3: [
    "sessionId",
  ],
};

const STEP_TITLES = [
  "Basic Info",
  "Academic Structure",
  "Session Mapping",
];

export function AddCourseDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [generatedSemesters, setGeneratedSemesters] = useState<string[]>([]);
  const [stepError, setStepError] = useState("");
  const addCourse = useAddCourse();
  const {
    data: departments = [],
    isPending: departmentsPending,
    isError: departmentsError,
    error: departmentsErrorMessage,
  } = useQuery(getDepartment());
  const {
    data: sessions = [],
    isPending: sessionsPending,
    isError: sessionsError,
    error: sessionsErrorMessage,
  } = useGetAcademicSessions();

  const form = useForm<AddCourseSchema>({
    resolver: zodResolver(addCourseSchema) as never,
    defaultValues: {
      name: "",
      code: "",
      type: "UG Regular",
      description: "",
      departmentId: "",
      duration: 4,
      sessionId: "",
    },
  });

  const durationValue = Number(
    useWatch({ control: form.control, name: "duration" }),
  );

  const previewSemesters = useMemo(
    () => buildSemesterLabels(durationValue || 0),
    [durationValue],
  );

  useEffect(() => {
    setGeneratedSemesters([]);
    setStepError("");
  }, [durationValue]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setStep(1);
      setGeneratedSemesters([]);
      setStepError("");
    }
  }, [open, form]);

  const handleNext = async () => {
    if (step === 1) {
      const valid = await form.trigger(STEP_FIELDS[1]);
      if (!valid) {
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!generatedSemesters.length) {
        setStepError("Generate semesters before continuing.");
        return;
      }
      setStepError("");
      setStep(3);
    }
  };

  const handleBack = () => {
    setStepError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleGenerateSemesters = () => {
    if (!previewSemesters.length) {
      setStepError("Select a valid duration to generate semesters.");
      return;
    }
    setGeneratedSemesters(previewSemesters);
    setStepError("");
  };

  async function onSubmit(values: AddCourseSchema) {
    if (!generatedSemesters.length) {
      setStep(2);
      setStepError("Generate semesters before saving.");
      return;
    }

    await addCourse.mutateAsync(values);
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Create Course
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[calc(100vh-6rem)] overflow-y-auto sm:max-w-3xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Create Course</AlertDialogTitle>
            <AlertDialogDescription>
              Build a course in guided steps.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-wrap gap-2 px-4">
            {STEP_TITLES.map((title, index) => {
              const currentStep = index + 1;
              return (
                <Badge
                  key={title}
                  variant={currentStep === step ? "default" : "outline"}
                >
                  Step {currentStep}: {title}
                </Badge>
              );
            })}
          </div>

          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            {step === 1 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Course Name</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. Bachelor of Computer Applications"
                          {...field}
                          aria-invalid={fieldState.invalid || departmentsError}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Code</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="e.g. BCA"
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Type</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          {COURSE_TYPES.map((type) => (
                            <NativeSelectOption key={type} value={type}>
                              {type}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Description</FieldLabel>
                      <FieldContent>
                        <Input
                          placeholder="Short overview of the course"
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="departmentId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || departmentsError}>
                      <FieldLabel required>Department</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                          disabled={departmentsPending || departmentsError}
                        >
                          <NativeSelectOption value="">
                            Select department
                          </NativeSelectOption>
                          {departments.map((department) => (
                            <NativeSelectOption
                              key={department.id}
                              value={department.id}
                            >
                              {department.name}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <FieldError
                          errors={[
                            fieldState.error,
                            departmentsError
                              ? {
                                  message:
                                    departmentsErrorMessage?.message ||
                                    "Failed to load departments",
                                }
                              : undefined,
                          ]}
                        />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="duration"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel required>Duration (Years)</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={String(field.value)}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          {COURSE_DURATIONS.map((duration) => (
                            <NativeSelectOption
                              key={duration}
                              value={String(duration)}
                            >
                              {duration} Years
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm text-muted-foreground">
                    Duration:{" "}
                    <span className="font-semibold text-foreground">
                      {durationValue || 0} Years
                    </span>
                  </p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    Will generate:
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {previewSemesters.length} semesters
                      </Badge>
                      {previewSemesters.length > 0 && (
                        <Badge variant="outline">
                          {previewSemesters[0]} to{" "}
                          {previewSemesters[previewSemesters.length - 1]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={handleGenerateSemesters}>
                  Generate Semesters
                </Button>

                {generatedSemesters.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-foreground">
                      Generated Semesters
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {generatedSemesters.map((semester) => (
                        <Badge key={semester} variant="outline">
                          {semester}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-3">
                <Controller
                  control={form.control}
                  name="sessionId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || sessionsError}>
                      <FieldLabel required>Academic Session</FieldLabel>
                      <FieldContent>
                        <NativeSelect
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid || sessionsError}
                          className="w-full"
                          disabled={sessionsPending || sessionsError}
                        >
                          <NativeSelectOption value="">
                            Select session
                          </NativeSelectOption>
                          {sessions.map((session) => (
                            <NativeSelectOption
                              key={session.id}
                              value={session.id}
                            >
                              {session.name}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                        <FieldError
                          errors={[
                            fieldState.error,
                            sessionsError
                              ? {
                                  message:
                                    sessionsErrorMessage?.message ||
                                    "Failed to load sessions",
                                }
                              : undefined,
                          ]}
                        />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            )}
          </div>

          {stepError ? (
            <div className="px-4 text-sm text-destructive">{stepError}</div>
          ) : null}

          {addCourse.error ? (
            <div className="px-4 text-sm text-destructive">
              {addCourse.error.message}
            </div>
          ) : null}

          <AlertDialogFooter className="flex flex-wrap gap-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Create Course"}
              </Button>
            )}
            <AlertDialogCancel asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
