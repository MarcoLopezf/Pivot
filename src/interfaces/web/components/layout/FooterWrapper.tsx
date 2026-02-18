"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

/**
 * FooterWrapper - Client Component that conditionally renders SiteFooter
 *
 * Uses usePathname() instead of server-side headers() so the visibility
 * updates correctly on client-side navigation (e.g. onboarding → roadmap).
 *
 * @layer Interface (Web)
 */
export function FooterWrapper(): React.ReactElement | null {
  const pathname = usePathname();

  if (pathname.startsWith("/onboarding")) return null;

  return <SiteFooter />;
}
