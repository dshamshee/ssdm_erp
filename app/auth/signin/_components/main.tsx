"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your Email or UAN number to sign in
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
