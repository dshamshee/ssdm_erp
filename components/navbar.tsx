import { SheetMenu } from "@/components/sheet-menu";
import { UserNav } from "@/components/user-nav";
// import { ModeToggle } from "@/components/mode-toggle";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-sidebar/95 text-sidebar-foreground shadow backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 dark:shadow-sidebar-border">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 gap-2 items-center justify-end">
          {/* <ModeToggle /> */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
