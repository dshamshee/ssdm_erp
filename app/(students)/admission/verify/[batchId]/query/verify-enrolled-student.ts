import { fetchEnrolledStudent } from "../lib/action";

export function verifyEnrolledStudentMutationOptions(batchId: string) {
  return {
    mutationKey: ["verify_enrolled_student", batchId],
    mutationFn: async ({ UAN, MJC }: { UAN: string; MJC: string }) => {
      const res = await fetchEnrolledStudent({ batchId, UAN, MJC });
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    retry: false,
  };
}
