import Link from "next/link";

export function Footer() {
  return (
    <div className="z-20 w-full bg-sidebar/95 text-sidebar-foreground shadow backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center justify-between">
        <p className="text-xs md:text-sm leading-loose text-sidebar-foreground/70 text-left">
          SSDM ERP - all rights reserved © {new Date().getFullYear()}
        </p>
        <p className="text-xs md:text-sm leading-loose text-sidebar-foreground/50 text-right">
          Developed & Managed by{" "}
          <a
            href="https://vaastman.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sidebar-foreground/70 hover:underline hover:text-sidebar-foreground transition-colors"
          >
            Vastaman Solutions
          </a>
        </p>
      </div>
    </div>
  );
}
