"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@infrastructure/auth/supabase/server";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { UserId } from "@domain/profile/value-objects/UserId";

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

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return {
        success: false,
        error: "Name must be between 2 and 100 characters",
      };
    }

    const trimmedBio = bio?.trim() || null;
    if (trimmedBio && trimmedBio.length > 500) {
      return { success: false, error: "Bio must be 500 characters or less" };
    }

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
