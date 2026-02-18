"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { headers } from "next/headers";

/**
 * Server Action: Request Password Reset
 *
 * Sends a password reset email to the user via Supabase Auth.
 * Supabase will use the configured SMTP provider (Resend) to deliver the email.
 *
 * @param email - The user's email address
 * @returns `{ success: true }` on success, `{ success: false, error: string }` on failure
 *
 * @layer Interface (Web)
 */
export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    const origin = `${protocol}://${host}`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}
