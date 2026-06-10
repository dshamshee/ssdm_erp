"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface ErrorDisplayProps {
  message?: string;
  showButton?: boolean;
  redirectPath?: string;
  buttonText?: string;
  refreshButton?: boolean;
  height?: "screen" | "1";
}

export function ErrorDisplay({
  message = "Something went wrong. Please try again.",
  showButton = true,
  redirectPath = "/",
  buttonText = "Go to Home Page",
  refreshButton = false,
  height = "1",
}: ErrorDisplayProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(redirectPath);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className={`flex items-center justify-center p-4 ${
        height === "screen" ? "min-h-screen" : "min-h-[50vh]"
      }`}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center">
            <AlertCircle className="text-destructive size-12" />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-destructive text-center font-medium">{message}</p>
        </CardContent>

        {(showButton || refreshButton) && (
          <CardFooter className="flex justify-center gap-2">
            {refreshButton && (
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 size-4" />
                Refresh Page
              </Button>
            )}

            {showButton && (
              <Button onClick={handleRedirect}>{buttonText}</Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
