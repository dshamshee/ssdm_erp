import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProviders } from "@/components/query-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "SANT SANDHYA DAS MAHILA COLLEGE",
  description: "SANT SANDHYA DAS MAHILA COLLEGE - ERP System",
  icons: {
    icon: "/college.png",
    apple: "/college.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <QueryProviders>
            <main>{children}</main>
          </QueryProviders>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
