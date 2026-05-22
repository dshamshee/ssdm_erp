import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      {/* condition check session exist or not */}
      {session?.user ? (
        <div>
          <p>user name: {session.user.name}</p>
          <p>user email: {session.user.email}</p>
          <p>role: {session.user.role}</p>
          <a href="/department">go to department</a>
        </div>
      ) : (
        <div>
          <p>Session not exist</p>
          <a href="/auth/student/signup">Student Signup</a>
          <a href="/auth/admin/signup">Admin Signup</a>
          <a href="/department">Department</a>
        </div>
      )}
    </div>
  );

  // return (
  //   <div>
  //     <LoaderScreen message="User details is loading..." />
  //     <ErrorDisplay />
  //   </div>
  // )
}
