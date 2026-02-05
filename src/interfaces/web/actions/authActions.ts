"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server Action: Logout
 *
 * Signs out the current user and redirects to login page.
 *
 * @layer Interface (Web)
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
