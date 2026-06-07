'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerifyStudentUANType, verifyStudentUANZodSchema } from '../lib/zod-type/verify-student-uan'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputForVerification } from "./input-for-verification";
import { useMutation } from "@tanstack/react-query";
import { verifyEnrolledStudentMutationOptions } from "../query/verify-enrolled-student";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const VerificationCard = ({ batchId }: { batchId: string }) => {
  const router = useRouter();
  const form = useForm<VerifyStudentUANType>({
    resolver: zodResolver(verifyStudentUANZodSchema),
    defaultValues: {
      uan: "",
      subMJC: "",
    }
  })

  const [uan, setUan] = useState("")
  const [mjc, setMjc] = useState("")
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    ...verifyEnrolledStudentMutationOptions(batchId),
  });

  const onSubmit = (data: VerifyStudentUANType) => {
    setUan(data.uan);
    setMjc(data.subMJC)
    mutate({UAN: data.uan, MJC: data.subMJC});
  }

  useEffect(() => {
    if (isSuccess) {
      router.push(`/admission/register?batch=${batchId}&uan=${uan}&mjc=${mjc}`);
    }
  }, [isSuccess, router, batchId, uan, mjc]);


  return (
    <Card className="max-w-[600px] mx-auto w-full">
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-center text-lg">Please Verify your identity to proceed with the admission process</CardTitle>
          </CardHeader>

          <div className="flex  flex-col justify-center items-center gap-5 mt-5">
          <InputForVerification form={form} />
          </div>

          {isSuccess && (
            <p className="text-sm text-green-600 mt-2">Student verified successfully!</p>
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
  )
}

