import {
  IconDashboard,
  IconClipboardCheck,
  IconCertificate,
  IconCalendarEvent,
  IconUser,
  IconFileText,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type Submenu = { href: string; label: string; active?: boolean };

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
  submenus?: Submenu[];
};

type Group = { groupLabel: string; menus: Menu[] };

export function getStudentMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "/student/dashboard",
          label: "Dashboard",
          icon: IconDashboard,
          active: pathname === "/student/dashboard",
        },
        {
          href: "/student/profile",
          label: "My Profile",
          icon: IconUser,
          active: pathname.startsWith("/student/profile"),
        },
      ],
    },
    {
      groupLabel: "Academics",
      menus: [
        {
          href: "/student/exams",
          label: "Examinations",
          icon: IconClipboardCheck,
          active: pathname.startsWith("/student/exams"),
        },
        {
          href: "/student/results",
          label: "Results",
          icon: IconFileText,
          active: pathname.startsWith("/student/results"),
        },
        {
          href: "/student/certificates",
          label: "Certificates",
          icon: IconCertificate,
          active: pathname.startsWith("/student/certificates"),
        },
        {
          href: "/student/schedule",
          label: "Schedule",
          icon: IconCalendarEvent,
          active: pathname.startsWith("/student/schedule"),
        },
      ],
    },
  ];
}
