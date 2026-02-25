"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@infrastructure/auth/supabase/server";
import { onboardingContainer } from "@infrastructure/di/OnboardingContainer";
import { prisma } from "@infrastructure/database/PrismaClient";
import { RoadmapLimitExceededError } from "@domain/learning/errors/RoadmapLimitExceededError";

/**
 * Server Action: Save Onboarding Step
 *
 * Saves the user's current onboarding progress to the database.
 * This is called from the client-side store to persist state.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only allows users to save their own progress
 *
 * @param step - Current step number (1-5)
 * @param data - Partial onboarding data
 * @returns Success status
 *
 * @layer Interface (Web)
 */
export async function saveStepAction(
  step: number,
  data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // 2. Ensure User record exists in database (create if not exists)
    // This is necessary because Supabase auth creates users in auth.users,
    // but we need a corresponding record in our User table for foreign key constraints
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      },
      update: {}, // Don't update if already exists
    });

    // 3. Validate step number
    if (step < 1 || step > 6) {
      throw new Error("Invalid step number. Must be between 1 and 6.");
    }

    // 4. Get use case from DI container
    const saveOnboardingStep = onboardingContainer.saveOnboardingStep;

    // 5. Execute use case
    await saveOnboardingStep.execute(user.id, step, data);

    // 6. Return success
    return { success: true };
  } catch (error) {
    console.error("Error in saveStepAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save onboarding progress",
    };
  }
}

/**
 * Server Action: Get Onboarding State
 *
 * Retrieves the user's current onboarding progress from the database.
 * Used to restore onboarding state when a user returns to the flow.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only returns the authenticated user's own progress
 *
 * @returns Current onboarding state or null if not started
 *
 * @layer Interface (Web)
 */
export async function getOnboardingStateAction(): Promise<{
  success: boolean;
  state?: { step: number; data: Record<string, unknown> } | null;
  error?: string;
}> {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // 2. Ensure User record exists in database (create if not exists)
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      },
      update: {}, // Don't update if already exists
    });

    // 3. Get use case from DI container
    const getOnboardingStatus = onboardingContainer.getOnboardingStatus;

    // 4. Execute use case
    const session = await getOnboardingStatus.execute(user.id);

    // 5. Return state if found
    if (!session) {
      return { success: true, state: null };
    }

    return {
      success: true,
      state: {
        step: session.currentStep,
        data: session.data,
      },
    };
  } catch (error) {
    console.error("Error in getOnboardingStateAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve onboarding progress",
    };
  }
}

/**
 * Server Action: Complete Onboarding
 *
 * Finalizes the onboarding process by:
 * - Migrating onboarding data to user profile
 * - Creating a career goal
 * - Generating a personalized roadmap via AI
 * - Marking onboarding as complete
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only allows users to complete their own onboarding
 *
 * @returns Success status and redirect URL
 *
 * @layer Interface (Web)
 */
export async function completeOnboardingAction(): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Resolve from container — returns the new roadmap ID
    const roadmapId = await onboardingContainer.completeOnboarding.execute(
      user.id,
    );

    // Invalidate cached layout so SiteHeader re-fetches roadmaps list
    revalidatePath("/", "layout");

    return { success: true, redirectUrl: `/roadmap/${roadmapId}` };
  } catch (error) {
    console.error("Onboarding completion failed:", error);
    if (error instanceof RoadmapLimitExceededError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to generate roadmap" };
  }
}
