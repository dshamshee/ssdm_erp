"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { StudentMenu } from "@/components/student/student-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export function StudentSidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) {
    return null;
  }
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden",
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-sidebar-border bg-sidebar text-sidebar-foreground"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0",
          )}
          variant="link"
          asChild
        >
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 mr-1" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                !getOpenState()
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100",
              )}
            >
              Student Portal
            </h1>
          </Link>
        </Button>
        <StudentMenu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
