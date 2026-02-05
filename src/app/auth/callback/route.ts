import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Auth Callback Route - Exchanges Auth Code for Session
 *
 * This route handles authentication callbacks for:
 * - OAuth providers (GitHub, Google)
 * - Email confirmation links (Magic Links)
 *
 * It exchanges the authorization code for a session cookie, enabling SSR.
 *
 * Flow:
 * 1. User authenticates (OAuth or email confirmation)
 * 2. Provider/Supabase redirects back to this route with `code` param
 * 3. We exchange the code for a session using Supabase
 * 4. Redirect user to the intended destination (default: /onboarding)
 *
 * @example
 * OAuth: /auth/callback?code=xyz&next=/onboarding
 * Email: /auth/callback?code=xyz (from confirmation email)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/onboarding";

  if (code) {
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                });
              } catch {
                // The setAll method was called from a Server Component.
                // This can be ignored if you have middleware refreshing user sessions.
              }
            },
          },
        },
      );

      // Exchange the authorization code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          new URL("/login?error=auth_code_error", request.url),
        );
      }

      // Authentication successful - redirect to intended destination
      return NextResponse.redirect(new URL(next, request.url));
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      return NextResponse.redirect(
        new URL("/login?error=unexpected_error", request.url),
      );
    }
  }

  // No code provided - redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=no_code_provided", request.url),
  );
}
