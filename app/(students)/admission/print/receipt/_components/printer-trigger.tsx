"use client";

import { useEffect } from "react";

interface PrinterTriggerProps {
  delayMs?: number;
}

export function PrinterTrigger({ delayMs = 500 }: PrinterTriggerProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return null;
}
