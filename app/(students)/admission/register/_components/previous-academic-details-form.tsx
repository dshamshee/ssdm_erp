"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AcademicDetailsType } from "../lib/zod-type/student-data";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  School,
  MapPin,
  Calculator,
  ChevronDown,
  ChevronUp,
  Percent,
} from "lucide-react";

export const PreviousAcademicDetailsForm = ({
  form,
}: {
  form: UseFormReturn<AcademicDetailsType>;
}) => {
  const [showUgDetails, setShowUgDetails] = useState(false);

  // Auto-calculate High School percentage when obtainedMarks or totalMarks change
  const HSObtained = form.watch("obtainedMarks");
  const HSTotal = form.watch("totalMarks");

  useEffect(() => {
    const obtained = Number(HSObtained);
    const total = Number(HSTotal);
    if (total > 0 && obtained >= 0) {
      const percentage = parseFloat(((obtained / total) * 100).toFixed(2));
      form.setValue("percentage", percentage, { shouldValidate: true });
    }
  }, [HSObtained, HSTotal, form]);

  // Auto-calculate UG percentage when ugObtainedMarks or ugTotalMarks change
  const UGObtained = form.watch("ugObtainedMarks");
  const UGTotal = form.watch("ugTotalMarks");

  useEffect(() => {
    const obtained = Number(UGObtained);
    const total = Number(UGTotal);
    if (total > 0 && obtained >= 0) {
      const percentage = parseFloat(((obtained / total) * 100).toFixed(2));
      form.setValue("ugPercentage", percentage, { shouldValidate: true });
    }
  }, [UGObtained, UGTotal, form]);

  return (
    <Card className="border border-muted-foreground/10 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-chart-2" />
          <CardTitle className="font-semibold text-xl">
            Previous Academic Details
          </CardTitle>
        </div>
        <CardDescription>
          Provide details about your qualifying and past academic records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* SECTION 1: Higher Secondary Details (Required) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-muted-foreground/10 pb-2">
            <School className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Higher Secondary (10+2) / Intermediate
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* School Name */}
            <Controller
              control={form.control}
              name="schoolName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>School / College Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="School/College Name"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Board */}
            <Controller
              control={form.control}
              name="board"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Board / University</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: CBSE, BSEB, ICSE"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Roll No */}
            <Controller
              control={form.control}
              name="rollNo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Roll Number</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter Roll Number"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Roll Code */}
            <Controller
              control={form.control}
              name="rollCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Roll Code</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter Roll Code"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Total Marks */}
            <Controller
              control={form.control}
              name="totalMarks"
              render={({
                field: { value, onChange, ...fieldProps },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Total Marks</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      value={value ?? ""}
                      onChange={(e) =>
                        onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: 500"
                      {...fieldProps}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Obtained Marks */}
            <Controller
              control={form.control}
              name="obtainedMarks"
              render={({
                field: { value, onChange, ...fieldProps },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Obtained Marks</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      value={value ?? ""}
                      onChange={(e) =>
                        onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: 380"
                      {...fieldProps}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Percentage */}
            <Controller
              control={form.control}
              name="percentage"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>Percentage (%)</FieldLabel>
                  <FieldContent>
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        aria-invalid={fieldState.invalid}
                        readOnly
                        className="bg-muted/30 pr-10"
                      />
                      <Percent className="absolute right-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />

            {/* Address */}
            <Controller
              control={form.control}
              name="address"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="col-span-1 md:col-span-2"
                >
                  <FieldLabel required>School/College Address</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Full address of the school"
                    />
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
                  <FieldLabel required>City</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
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
                  <FieldLabel required>District</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
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
                  <FieldLabel required>State</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
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
                  <FieldLabel required>PIN Code</FieldLabel>
                  <FieldContent>
                    <Input
                      maxLength={6}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="6-digit PIN code"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        </div>

        {/* SECTION 2: Undergraduate Records (Optional / Toggleable) */}
        <div className="space-y-4 pt-4 border-t border-muted-foreground/10">
          <button
            type="button"
            onClick={() => setShowUgDetails(!showUgDetails)}
            className="flex items-center justify-between w-full p-3.5 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-muted-foreground/5 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4.5 w-4.5 text-chart-3" />
              <div>
                <span className="font-bold text-foreground block text-sm">
                  Undergraduate (UG) Academic Record
                </span>
                <span className="text-xs text-muted-foreground">
                  Click to fill if you are applying for a PG program
                </span>
              </div>
            </div>
            {showUgDetails ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showUgDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 animate-fadeIn">
              {/* Institute Name */}
              <Controller
                control={form.control}
                name="ugInstituteName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>College / Institute Name</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter UG College Name"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* University Name */}
              <Controller
                control={form.control}
                name="ugUniversityName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>University Name</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter UG University Name"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG Roll No */}
              <Controller
                control={form.control}
                name="ugRollNo"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG Roll Number</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter UG Roll Number"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG Total Marks */}
              <Controller
                control={form.control}
                name="ugTotalMarks"
                render={({
                  field: { value, onChange, ...fieldProps },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG Total Marks</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        value={value ?? ""}
                        onChange={(e) =>
                          onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        aria-invalid={fieldState.invalid}
                        placeholder="Ex: 2400"
                        {...fieldProps}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG Obtained Marks */}
              <Controller
                control={form.control}
                name="ugObtainedMarks"
                render={({
                  field: { value, onChange, ...fieldProps },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG Obtained Marks</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        value={value ?? ""}
                        onChange={(e) =>
                          onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                        aria-invalid={fieldState.invalid}
                        placeholder="Ex: 1850"
                        {...fieldProps}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG Percentage */}
              <Controller
                control={form.control}
                name="ugPercentage"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG Percentage (%)</FieldLabel>
                    <FieldContent>
                      <div className="relative flex items-center">
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          aria-invalid={fieldState.invalid}
                          readOnly
                          className="bg-muted/30 pr-10"
                        />
                        <Percent className="absolute right-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG Address */}
              <Controller
                control={form.control}
                name="ugAddress"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-1 md:col-span-2"
                  >
                    <FieldLabel>UG Institute Address</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Full address of the UG college"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG City */}
              <Controller
                control={form.control}
                name="ugCity"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG City</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter City"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG District */}
              <Controller
                control={form.control}
                name="ugDistrict"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG District</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter District"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG State */}
              <Controller
                control={form.control}
                name="ugState"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG State</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter State"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* UG PIN Code */}
              <Controller
                control={form.control}
                name="ugPinCode"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>UG PIN Code</FieldLabel>
                    <FieldContent>
                      <Input
                        maxLength={6}
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="6-digit PIN code"
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
