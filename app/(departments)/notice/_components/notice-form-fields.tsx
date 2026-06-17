"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { FileUp, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NoticeFormFieldsProps {
  // biome-ignore lint/suspicious/noExplicitAny: form needs to accept both add and update schemas
  form: UseFormReturn<any>;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export function NoticeFormFields({ form }: NoticeFormFieldsProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const currentFileUrl = form.watch("file");

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (file.type !== "application/pdf") {
        setUploadError("Only PDF files are allowed");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File size must be under 500KB");
        return;
      }

      setUploading(true);
      setFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();

        if (!json.success || !json.urls?.file) {
          throw new Error(json.message || "Upload failed");
        }

        form.setValue("file", json.urls.file, {
          shouldValidate: true,
        });
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Upload failed. Try again.",
        );
        setFileName(null);
      } finally {
        setUploading(false);
      }
    },
    [form],
  );

  const handleRemoveFile = useCallback(() => {
    form.setValue("file", "", { shouldValidate: true });
    setFileName(null);
    setUploadError(null);
  }, [form]);

  return (
    <div className="grid gap-3">
      <Controller
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>Title</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Enter notice title"
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
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
            <FieldLabel>Description</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Enter notice description (optional)"
                value={field.value ?? ""}
                onChange={field.onChange}
                aria-invalid={fieldState.invalid}
                rows={3}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="startDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>Start Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="endDate"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>End Date</FieldLabel>
              <FieldContent>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </div>

      {/* PDF Upload */}
      <Controller
        control={form.control}
        name="file"
        render={({ fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel required>File (PDF, max 500KB)</FieldLabel>
            <FieldContent>
              {currentFileUrl ? (
                <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileUp className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm">
                      {fileName || "Uploaded file"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={handleRemoveFile}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/20">
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp className="size-4" />
                      Click to upload PDF
                    </>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                      // Reset so re-selecting the same file triggers onChange
                      e.target.value = "";
                    }}
                  />
                </label>
              )}

              {uploadError && (
                <p className="text-sm text-destructive mt-1">{uploadError}</p>
              )}
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
