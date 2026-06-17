"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DocumentsUploadType } from "../lib/zod-type/student-data";
import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Image as ImageIcon,
  PenTool,
} from "lucide-react";

export const DocumentsUploadForm = ({
  form,
}: {
  form: UseFormReturn<DocumentsUploadType>;
}) => {
  const [fileNames, setFileNames] = useState<Record<string, string>>({});

  const handleFileChange = (
    fieldName: keyof DocumentsUploadType,
    file: File | undefined,
    onChange: (val: any) => void,
  ) => {
    if (file) {
      onChange(file);
      setFileNames((prev) => ({ ...prev, [fieldName]: file.name }));
      console.log(`Document ${fieldName} selected:`, file.name);
    } else {
      onChange(undefined);
      setFileNames((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  // Helper component to render an individual document upload input card
  const DocumentInputCard = ({
    name,
    label,
    description,
    required = false,
    accept = ".pdf,.jpg,.jpeg,.png",
    icon: Icon = FileText,
  }: {
    name: keyof DocumentsUploadType;
    label: string;
    description: string;
    required?: boolean;
    accept?: string;
    icon?: React.ComponentType<any>;
  }) => {
    return (
      <Controller
        control={form.control}
        name={name}
        render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex flex-col gap-2">
              <div
                className={`relative group/doc flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer min-h-[9rem] ${
                  fieldState.invalid
                    ? "border-destructive bg-destructive/5"
                    : fileNames[name]
                      ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : "border-input bg-muted/20 hover:border-primary hover:bg-muted/40"
                }`}
              >
                <input
                  type="file"
                  accept={accept}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 1024 * 1024) {
                      alert(
                        `Warning: The file "${file.name}" exceeds the 1MB size limit. Please upload a file under 1MB.`,
                      );
                      e.target.value = ""; // Clear the HTML input
                      form.setError(name, {
                        type: "manual",
                        message: "File size must be under 1MB",
                      });
                      handleFileChange(name, undefined, onChange);
                    } else {
                      form.clearErrors(name);
                      handleFileChange(name, file, onChange);
                    }
                  }}
                  {...fieldProps}
                />

                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  {fileNames[name] ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : fieldState.invalid ? (
                    <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
                  ) : (
                    <Icon className="h-8 w-8 text-muted-foreground group-hover/doc:text-primary transition-colors" />
                  )}

                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-foreground block">
                      {label}{" "}
                      {required && (
                        <span className="text-destructive font-bold">*</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {description}
                    </span>
                  </div>
                </div>
              </div>

              {fileNames[name] && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1.5 rounded-full w-fit max-w-full">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold truncate max-w-[200px]">
                    {fileNames[name]}
                  </span>
                </div>
              )}

              <FieldError errors={[fieldState.error]} />
            </div>
          </Field>
        )}
      />
    );
  };

  return (
    <Card className="border border-muted-foreground/10 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-chart-1" />
          <CardTitle className="font-semibold text-xl">
            Documents Upload
          </CardTitle>
        </div>
        <CardDescription>
          Upload scanned copies of required certificates and documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Required Documents Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-muted-foreground/10 pb-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Required Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentInputCard
              name="photo"
              label="Passport Size Photograph"
              description="JPG, PNG up to 1MB"
              required
              accept=".jpg,.jpeg,.png"
              icon={ImageIcon}
            />
            <DocumentInputCard
              name="signature"
              label="Student Signature"
              description="JPG, PNG up to 1MB"
              required
              accept=".jpg,.jpeg,.png"
              icon={PenTool}
            />
            <DocumentInputCard
              name="Aadhar"
              label="Aadhar Card"
              description="PDF, JPG, PNG up to 1MB"
              required
            />
          </div>
        </div>

        {/* Optional / Category-specific Documents Section */}
        <div className="space-y-6 pt-4 border-t border-muted-foreground/10">
          <div className="flex items-center gap-2 pb-2">
            <FileText className="h-4.5 w-4.5 text-chart-3" />
            <h3 className="text-base font-bold text-foreground">
              Optional / Category-specific Documents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentInputCard
              name="previousMarksheet"
              label="Previous Year Marksheet"
              description="PDF, JPG, PNG up to 1MB"
            />
            <DocumentInputCard
              name="previousLC"
              label="College Leaving Certificate (CLC)"
              description="PDF, JPG, PNG up to 1MB"
            />
            <DocumentInputCard
              name="previousMigration"
              label="Migration Certificate"
              description="PDF, JPG, PNG up to 1MB"
            />
            <DocumentInputCard
              name="cast"
              label="Caste Certificate"
              description="OBC/SC/ST candidates (up to 1MB)"
            />
            <DocumentInputCard
              name="domicile"
              label="Domicile Certificate"
              description="PDF, JPG, PNG up to 1MB"
            />
            <DocumentInputCard
              name="income"
              label="Income Certificate"
              description="PDF, JPG, PNG up to 1MB"
            />
            <DocumentInputCard
              name="pwd"
              label="PWD Certificate"
              description="Disability certificate (up to 1MB)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
