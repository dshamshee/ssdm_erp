"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { signUp } from "@/lib/auth-client";
import { type SignupSchema, signupSchema } from "../lib/zod-type/signup-type";
import { InputForSignup } from "./Input-for-signup";

export function MainSignupForm() {
  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupSchema) => {
    await signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "student",
      },
      {
        onSuccess: () => {
          alert("Sign up success");
          form.reset();
        },
        onError: (ctx) => {
          alert(ctx.error.message);
          form.reset();
        },
      },
    );
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <InputForSignup form={form} />
              </div>
              <Button type="submit" className="w-full">
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                  Sign up
                </LoadingSwap>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
