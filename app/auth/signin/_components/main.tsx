"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { signIn } from "@/lib/auth-client";
import { type SigninSchema, signinSchema } from "../lib/zod-type/signin-type";
import { InputForSignin } from "./Input-for-signin";
export function MainSigninForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<SigninSchema>({
    resolver: zodResolver(signinSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: SigninSchema) => {
    setErrorMsg("");

    const rawIdentifier = data.identifier.trim();
    // We format UAN into a fake email so better-auth accepts the input format.
    const isEmail = rawIdentifier.includes("@");
    const email = isEmail
      ? rawIdentifier
      : `${rawIdentifier.toLowerCase()}@student.ssdm.local`;

    const { data: authData, error } = await signIn.email({
      email,
      password: data.password,
    });

    if (error) {
      setErrorMsg(error.message || "Invalid credentials");
      form.reset();
      return;
    }

    // Now we check their EXACT role from the database to route them!
    const userRole = authData?.user?.role;

    if (userRole === "student") {
      router.push("/student/dashboard");
    } else if (userRole === "admin" || userRole === "superAdmin") {
      router.push("/department");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold">
            Login Hint / लॉगिन संकेत
          </AlertTitle>
          <AlertDescription className="text-blue-700 text-xs leading-relaxed space-y-2">
            <p>
              <strong>For sessions before 2026:</strong> Your username is your{" "}
              <strong>University Roll No.</strong> and password is:{" "}
              <strong>first 4 letters of your name</strong> (lowercase, no space)
              + <strong>last 4 digits of your University Roll No.</strong>
            </p>
            <p>
              <strong>2026 से पहले के सत्र के लिए:</strong> आपका username आपका{" "}
              <strong>विश्वविद्यालय रोल नं.</strong> है और password है:{" "}
              <strong>आपके नाम के पहले 4 अक्षर</strong> (छोटे अक्षर में, बिना
              स्पेस) + <strong>विश्वविद्यालय रोल नं. के अंतिम 4 अंक</strong>
            </p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your Application No. or University Roll No. to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <InputForSignin form={form} />
              </div>

              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <Button type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Sign in
                </LoadingSwap>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
