import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/auth/supabase/middleware";

/**
 * Next.js Middleware - Runs on every request
 *
 * Responsibilities:
 * 1. Refreshes Supabase auth session on every request
 * 2. Protects authenticated routes (/dashboard/*, /onboarding/*)
 * 3. Redirects authenticated users away from auth pages (/login, /register)
 *
 * Route Protection Rules:
 * - Unauthenticated users trying to access /dashboard/* or /onboarding/* → redirect to /login
 * - Authenticated users trying to access /login or /register → redirect to /dashboard
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  // Auth pages that authenticated users shouldn't access
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // If user is not authenticated and tries to access protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and tries to access auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

/**
 * Matcher configuration for middleware
 * Runs on all routes except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes that handle their own auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
