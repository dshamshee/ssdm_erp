"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type VerifyStudentUANType,
  verifyStudentUANZodSchema,
} from "../lib/zod-type/verify-student-uan";
import { verifyEnrolledStudentMutationOptions } from "../query/verify-enrolled-student";
import { InputForVerification } from "./input-for-verification";

export const VerificationCard = ({ batchId }: { batchId: string }) => {
  const router = useRouter();
  const form = useForm<VerifyStudentUANType>({
    resolver: zodResolver(verifyStudentUANZodSchema),
    defaultValues: { uan: "", subMJC: "" },
  });

  const [uan, setUan] = useState("");
  const [mjc, setMjc] = useState("");
  const { mutate, isPending, isSuccess, isError, error, data } = useMutation({
    ...verifyEnrolledStudentMutationOptions(batchId),
  });

  const onSubmit = (formData: VerifyStudentUANType) => {
    setUan(formData.uan);
    setMjc(formData.subMJC);
    mutate({ UAN: formData.uan, MJC: formData.subMJC });
  };

  useEffect(() => {
    if (isSuccess && data) {
      if (data.isPendingPayment) {
        router.push(
          `/admission/payment?batch=${batchId}&uan=${uan}&studentId=${data.studentId}`,
        );
      } else {
        router.push(
          `/admission/register?batch=${batchId}&uan=${uan}&mjc=${mjc}`,
        );
      }
    }
  }, [isSuccess, data, router, batchId, uan, mjc]);

  return (
    <Card className="max-w-[600px] mx-auto w-full">
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              Please Verify your identity to proceed with the admission process
            </CardTitle>
          </CardHeader>

          <div className="flex  flex-col justify-center items-center gap-5 mt-5">
            <InputForVerification form={form} />
          </div>

          {isSuccess && (
            <p className="text-sm text-green-600 mt-2">
              Student verified successfully!
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive mt-2">{error.message}</p>
          )}

          <div className="flex justify-end mt-4 gap-4">
            <Button onClick={() => form.reset()} disabled={isPending}>
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              Verify
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
