import {
  IconBookmarkFilled,
  IconCalendarFilled,
  IconHomeFilled,
  IconLayoutDashboardFilled,
  IconUsers,
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

export function getMenuList(_pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: IconLayoutDashboardFilled,
          submenus: [],
        },
      ],
    },
    // {
    //   groupLabel: "",
    //   menus: [
    //     {
    //       href: "",
    //       label: "Posts",
    //       icon: SquarePen,
    //       submenus: [
    //         {
    //           href: "/posts",
    //           label: "All Posts",
    //         },
    //         {
    //           href: "/posts/new",
    //           label: "New Post",
    //         },
    //       ],
    //     },
    //     {
    //       href: "/categories",
    //       label: "Categories",
    //       icon: Bookmark,
    //     },
    //     {
    //       href: "/tags",
    //       label: "Tags",
    //       icon: Tag,
    //     },
    //   ],
    // },
    {
      groupLabel: "",
      menus: [
        {
          href: "/college",
          label: "Manage colleges",
          icon: IconBookmarkFilled,
        },
        {
          href: "/academic-session",
          label: "Academic sessions",
          icon: IconCalendarFilled,
        },
        {
          href: "/add/candidate",
          label: "Internship",
          icon: IconUsers,
        },
        {
          href: "/home",
          label: "Home Page",
          icon: IconHomeFilled,
        },
      ],
    },
  ];
}
