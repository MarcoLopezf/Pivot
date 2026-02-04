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
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
