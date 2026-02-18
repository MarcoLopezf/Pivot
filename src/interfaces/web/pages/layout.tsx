import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@interfaces/web/components/layout/SiteHeader";
import { FooterWrapper } from "@interfaces/web/components/layout/FooterWrapper";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <SiteHeader />
        <main className="flex-1 bg-gray-100 text-slate-900">{children}</main>
        <FooterWrapper />
        <Toaster />
      </body>
    </html>
  );
}
