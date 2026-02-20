"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { headers } from "next/headers";
import { z } from "zod";
import { createLogger } from "@infrastructure/logging/logger";

const logger = createLogger("passwordResetActions");

const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

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
  const parsed = passwordResetSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, error: "Invalid email address" };
  }

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
      logger.security("PASSWORD_RESET_FAILED", { reason: error.message });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}
