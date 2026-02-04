import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components and Server Actions.
 * This client uses Next.js cookies() API to handle authentication state.
 *
 * @returns Supabase client configured for server-side rendering
 *
 * @example
 * // In a Server Component
 * import { createClient } from '@/infrastructure/auth/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   return <div>{user?.email}</div>;
 * }
 */
export async function createClient(): Promise<
  ReturnType<typeof createServerClient>
> {
  const cookieStore = await cookies();

  return createServerClient(
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
