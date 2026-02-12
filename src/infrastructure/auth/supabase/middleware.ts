import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Updates the user session by refreshing the auth token.
 * This should be called in the Next.js middleware on every request.
 *
 * Creates a Supabase client configured for middleware with proper cookie handling.
 * The client automatically refreshes expired sessions and manages auth state.
 *
 * @param request - The incoming Next.js request
 * @returns Object containing the NextResponse with updated cookies and the current user (if authenticated)
 *
 * @example
 * // In middleware.ts
 * import { updateSession } from '@/infrastructure/auth/supabase/middleware';
 *
 * export async function middleware(request: NextRequest) {
 *   const { response, user } = await updateSession(request);
 *   // Use user for route protection logic
 *   return response;
 * }
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
      auth: {
        // Increase timeout for auth requests to handle slow connections
        detectSessionInUrl: false,
        flowType: "pkce",
      },
      global: {
        // Add fetch options to increase timeout to 20 seconds
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(20000),
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Retry logic for network timeouts (handles intermittent connectivity issues)
  let user: User | null = null;
  let retries = 2;

  while (retries >= 0) {
    try {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();
      user = fetchedUser;
      break; // Success - exit retry loop
    } catch (error) {
      retries--;
      if (retries < 0) {
        console.error("Failed to fetch user after retries:", error);
        // Return null user on final failure (let app handle gracefully)
        user = null;
      } else {
        // Wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  return { response: supabaseResponse, user };
}
