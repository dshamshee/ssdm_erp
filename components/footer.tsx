import Link from "next/link";

export function Footer() {
  return (
    <div className="z-20 w-full bg-sidebar/95 text-sidebar-foreground shadow backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-sidebar-foreground/70 text-left">
          Vaastman - all rights reserved © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
