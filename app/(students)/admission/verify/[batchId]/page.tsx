import { VerificationCard } from "./_components/verificationCard";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  return (
    <div className="mainContainer w-auto flex flex-col py-10">
      <VerificationCard batchId={batchId} />
    </div>
  );
}
