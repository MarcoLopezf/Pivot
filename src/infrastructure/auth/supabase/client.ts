import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components.
 * This client uses browser cookies to handle authentication state.
 *
 * @returns Supabase client configured for browser/client-side rendering
 *
 * @example
 * // In a Client Component
 * 'use client';
 * import { createClient } from '@/infrastructure/auth/supabase/client';
 *
 * export default function ClientComponent() {
 *   const supabase = createClient();
 *
 *   const handleLogin = async () => {
 *     await supabase.auth.signInWithPassword({ email, password });
 *   };
 *
 *   return <button onClick={handleLogin}>Login</button>;
 * }
 */
export function createClient(): ReturnType<typeof createBrowserClient> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
