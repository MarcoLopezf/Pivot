"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@infrastructure/auth/supabase/server";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { UserId } from "@domain/profile/value-objects/UserId";

const ProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(500).nullable().optional(),
});

/**
 * Server Action: Update Profile
 *
 * Updates the authenticated user's name and bio.
 *
 * @layer Interface (Web)
 */
export async function updateProfileAction(
  name: string,
  bio: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = ProfileInputSchema.safeParse({ name, bio });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message ?? "Invalid input",
      };
    }
    const trimmedName = parsed.data.name;
    const trimmedBio = parsed.data.bio ?? null;

    const userRepository = profileContainer.getUserRepository();
    const user = await userRepository.findById(UserId.create(authUser.id));

    if (!user) {
      return { success: false, error: "User not found" };
    }

    user.updateProfile(trimmedName, user.location, trimmedBio);
    await userRepository.save(user);

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
