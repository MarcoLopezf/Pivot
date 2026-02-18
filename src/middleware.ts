import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/infrastructure/auth/supabase/middleware";

/**
 * Next.js Middleware - Runs on every request
 *
 * Responsibilities:
 * 1. Refreshes Supabase auth session on every request
 * 2. Protects authenticated routes (/roadmap/*, /onboarding/*)
 * 3. Redirects authenticated users away from auth pages (/login, /register)
 *
 * Route Protection Rules:
 * - Unauthenticated users trying to access /roadmap/* or /onboarding/* → redirect to /login
 * - Authenticated users trying to access /login or /register → redirect to /
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/update-password";

  // Auth pages that authenticated users shouldn't access
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // If user is not authenticated and tries to access protected routes
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    // Store the original URL to redirect back after login
    redirectUrl.searchParams.set("redirectTo", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Copy cookies from updateSession response to preserve refreshed session
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // If user is authenticated and tries to access auth pages
  if (user && isAuthPage) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));

    // Copy cookies from updateSession response to preserve refreshed session
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Clone request headers and add pathname for layout detection
  // RootLayout reads request headers via headers(), so x-pathname
  // must be set on the REQUEST, not the response
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Create new response with modified request headers
  const nextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copy cookies from updateSession response to preserve refreshed session
  // (updateSession may have refreshed auth tokens)
  response.cookies.getAll().forEach((cookie) => {
    nextResponse.cookies.set(cookie);
  });

  return nextResponse;
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
