import { queryOptions, useQuery } from "@tanstack/react-query";
import { verifyPayment } from "../lib/action";

export function verifyPaymentQuery(transactionId: string) {
  return queryOptions({
    queryKey: ["verify-payment", transactionId],
    queryFn: async () => {
      const res = await verifyPayment(transactionId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.payment;
    },
    enabled: !!transactionId,
    retry: false,
  });
}

export function useVerifyPayment(transactionId: string) {
  return useQuery(verifyPaymentQuery(transactionId));
}
