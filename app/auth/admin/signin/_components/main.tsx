"use client";

import { useForm } from "react-hook-form";
import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema, signinSchema } from "../lib/zod-type/signin-type";
import { InputForSingin } from "./Input-for-signin";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MainSigninForm() {
  const form = useForm<SigninSchema>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SigninSchema) => {
    await signIn.email(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          alert("Sign in success");
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
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <InputForSingin form={form} />
              </div>
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
