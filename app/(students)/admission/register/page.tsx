
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getEnrolledStudent } from "./query/get-enrolled-student";
import { StudentRegistration } from "./_components/student-registration";


// Define the props interface where searchParams is a Promise
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterStudents({ searchParams }: PageProps){


  // Await the searchParams promise to extract the parameters
  const resolvedParams = await searchParams;
  const batch = resolvedParams.batch as string;
  const UAN = resolvedParams.uan as string; // Assuming UAN also comes from the query
  const MJC = resolvedParams.mjc as string

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(getEnrolledStudent({batch, UAN, MJC}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <Register /> */}
      <StudentRegistration />
    </HydrationBoundary>
  )
} 