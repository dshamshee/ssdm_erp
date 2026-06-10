"use client";
import { Spinner } from "@/components/ui/spinner";

interface LoaderProps {
  message?: string;
  spinnerSize?: string; // Can be any Tailwind size like "size-4", "size-8", "size-16", etc.
  /** Subtract a fixed height (in px) from 100vh so the loader fills only the
   *  remaining viewport. Accepts a plain number so you can do arithmetic:
   *  offsetHeight={NAVBAR_HEIGHT}     → calc(100vh - 72px)
   *  offsetHeight={NAVBAR_HEIGHT * 2} → calc(100vh - 144px) */
  offsetHeight?: number;
}

export function LoaderScreen({
  message = "Loading...",
  spinnerSize = "size-8",
  offsetHeight,
}: LoaderProps) {
  const minHeight = offsetHeight ? `calc(100vh - ${offsetHeight}px)` : "100vh";

  return (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <div className="flex flex-col items-center gap-3">
        <Spinner className={spinnerSize} />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}
