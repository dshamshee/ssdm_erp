"use client";

import { Download, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CredentialsDialogProps {
  open: boolean;
  credentials: {
    username: string;
    password: string;
    name: string;
  } | null;
  onContinue: () => void;
}

export function CredentialsDialog({
  open,
  credentials,
  onContinue,
}: CredentialsDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!credentials) return null;

  const handleDownloadAndRedirect = async () => {
    setIsDownloading(true);

    // Build the text file content
    const content = [
      "═══════════════════════════════════════",
      "       SSDM ERP — LOGIN CREDENTIALS    ",
      "═══════════════════════════════════════",
      "",
      `  Name:             ${credentials.name}`,
      `  Username (UAN):   ${credentials.username}`,
      `  Password:         ${credentials.password}`,
      "",
      "───────────────────────────────────────",
      "  ⚠  Keep this file safe and private.",
      "     Do not share your password.",
      "───────────────────────────────────────",
    ].join("\n");

    // Trigger file download in the background
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SSDM_Credentials_${credentials.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Small delay so the browser registers the download before navigating
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Redirect to sign in page
    onContinue();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="size-5 text-amber-500" />
            Your Login Credentials
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Your account has been created successfully. Please download and save
            the following credentials carefully. You will need them to sign in
            and complete your admission.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-2">
          {/* Credentials box */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Name
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {credentials.name}
              </p>
            </div>
            <div className="border-t" />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Username (UAN)
              </p>
              <p className="text-sm font-mono font-semibold mt-0.5">
                {credentials.username}
              </p>
            </div>
            <div className="border-t" />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Password
              </p>
              <p className="text-sm font-mono font-semibold mt-0.5">
                {credentials.password}
              </p>
            </div>
          </div>

          {/* Warning box */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2.5">
            <ShieldAlert className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>Important:</strong> Download and save these credentials in
              a safe place. You will use them to sign in. Do not share your
              password with anyone.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            type="button"
            onClick={handleDownloadAndRedirect}
            disabled={isDownloading}
            className="w-full"
          >
            <LoadingSwap isLoading={isDownloading}>
              <span className="flex items-center justify-center gap-2">
                <Download className="size-4" />
                Download & Go to Sign In
              </span>
            </LoadingSwap>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
