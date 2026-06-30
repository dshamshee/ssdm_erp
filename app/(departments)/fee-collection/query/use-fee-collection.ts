import { useQuery } from "@tanstack/react-query";
import {
  getAdmissionsByDate,
  getFeeCollectionReport,
  getFilterOptions,
  getGlobalFeeStats,
  getPaymentsByDate,
  getPaymentStats,
} from "../lib/action";

interface AdmissionDateFilter {
  mode: "all" | "date" | "range";
  admissionDateFrom?: string;
  admissionDateTo?: string;
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["fee-collection-filter-options"],
    queryFn: async () => {
      const res = await getFilterOptions();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

export function useFeeCollectionReport(batchId: string, semesterCount: number) {
  return useQuery({
    queryKey: ["fee-collection-report", batchId, semesterCount],
    queryFn: async () => {
      if (!batchId || !semesterCount) {
        return null;
      }
      const res = await getFeeCollectionReport(batchId, semesterCount);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: !!batchId && !!semesterCount,
    retry: false,
  });
}

export function useGlobalFeeStats(filter?: AdmissionDateFilter) {
  return useQuery({
    queryKey: [
      "global-fee-stats",
      filter?.mode,
      filter?.admissionDateFrom,
      filter?.admissionDateTo,
    ],
    queryFn: async () => {
      const res = await getGlobalFeeStats(filter);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}

export function useAdmissionsByDate(filter: AdmissionDateFilter) {
  const isDateSelected = filter.mode !== "all";

  return useQuery({
    queryKey: [
      "admissions-by-date",
      filter.mode,
      filter.admissionDateFrom,
      filter.admissionDateTo,
    ],
    queryFn: async () => {
      const res = await getAdmissionsByDate(filter);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: isDateSelected,
    retry: false,
  });
}

export function usePaymentsByDate(filter: AdmissionDateFilter) {
  const isDateSelected = filter.mode !== "all";

  return useQuery({
    queryKey: [
      "payments-by-date",
      filter.mode,
      filter.admissionDateFrom,
      filter.admissionDateTo,
    ],
    queryFn: async () => {
      const res = await getPaymentsByDate(filter);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    enabled: isDateSelected,
    retry: false,
  });
}

export function usePaymentStats(filter?: AdmissionDateFilter) {
  return useQuery({
    queryKey: [
      "payment-stats",
      filter?.mode,
      filter?.admissionDateFrom,
      filter?.admissionDateTo,
    ],
    queryFn: async () => {
      const res = await getPaymentStats(filter);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res.data;
    },
    retry: false,
  });
}
