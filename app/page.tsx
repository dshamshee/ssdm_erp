import { prisma } from "@/lib/db";

export default async function Page() {
  const departments = await prisma.department.findFirst();

  return (
    <div>
      {departments?.name}
    </div>
  )

}