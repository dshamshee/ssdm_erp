import {
  IconSchool,
  IconHierarchy2,
  IconBook,
  IconBook2,
  IconCalendarEvent,
  IconUserCheck,
  IconClipboardCheck,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Academic Setup",
      menus: [
        {
          href: "/college",
          label: "Colleges",
          icon: IconSchool,
          active: pathname.startsWith("/college"),
        },
        {
          href: "/department",
          label: "Departments",
          icon: IconHierarchy2,
          active: pathname.startsWith("/department"),
        },
        {
          href: "/course",
          label: "Courses",
          icon: IconBook,
          active: pathname.startsWith("/course"),
        },
        {
          href: "/subjects",
          label: "Subjects",
          icon: IconBook2,
          active: pathname.startsWith("/subjects"),
        },
        {
          href: "/academic-session",
          label: "Academic Sessions",
          icon: IconCalendarEvent,
          active: pathname.startsWith("/academic-session"),
        },
      ],
    },
    {
      groupLabel: "Student Operations",
      menus: [
        {
          href: "/admission",
          label: "Admission",
          icon: IconUserCheck,
          active: pathname.startsWith("/admission"),
        },
        {
          href: "/examination",
          label: "Examination",
          icon: IconClipboardCheck,
          active: pathname.startsWith("/examination"),
        },
      ],
    },
  ];
}
