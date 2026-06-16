import StudentPanelLayout from "@/components/student/student-panel-layout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentPanelLayout>{children}</StudentPanelLayout>;
}
