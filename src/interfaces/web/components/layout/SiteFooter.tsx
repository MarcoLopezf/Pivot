import Link from "next/link";
import { Network } from "lucide-react";

/**
 * SiteFooter - Global Footer Component
 *
 * Displays footer with logo, navigation links, and copyright.
 * Used across all pages for consistent branding and legal links.
 *
 * @layer Interface (Web)
 */
export function SiteFooter(): React.ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-slate-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left: Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Network className="h-5 w-5 text-slate-900" />
          <span className="text-base font-bold tracking-tight text-slate-900">
            PIVOT
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Contact Support
          </Link>
        </nav>

        {/* Right: Copyright */}
        <div className="text-sm text-slate-500">
          © {currentYear} Pivot AI Inc.
        </div>
      </div>
    </footer>
  );
}
