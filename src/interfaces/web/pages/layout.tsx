import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@interfaces/web/components/layout/SiteHeader";
import { SiteFooter } from "@interfaces/web/components/layout/SiteFooter";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIVOT AI",
  description: "Your personalized career transition platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Hide footer on onboarding pages
  const hideFooter = pathname.startsWith("/onboarding");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <SiteHeader />
        <main className="flex-1 bg-gray-100 text-slate-900">{children}</main>
        {!hideFooter && <SiteFooter />}
        <Toaster />
      </body>
    </html>
  );
}
