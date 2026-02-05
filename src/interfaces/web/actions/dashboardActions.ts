"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { dashboardContainer } from "@infrastructure/di/DashboardContainer";
import { DashboardDTO } from "@application/dtos/dashboard/DashboardDTO";

/**
 * Server Action: Get User Dashboard
 *
 * Retrieves the authenticated user's dashboard data including:
 * - User profile
 * - Career goal
 * - Learning progress
 * - Next task
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only returns authenticated user's own data
 *
 * @returns Dashboard data or error
 *
 * @layer Interface (Web)
 */
export async function getDashboardAction(): Promise<{
  success: boolean;
  data?: DashboardDTO | null;
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
      return {
        success: false,
        error: "Unauthorized: User not authenticated",
      };
    }

    // 2. Get use case from DI container
    const getUserDashboard = dashboardContainer.getGetUserDashboardUseCase();

    // 3. Execute use case with authenticated user's ID
    const dashboardDTO = await getUserDashboard.execute(user.id);

    return {
      success: true,
      data: dashboardDTO,
    };
  } catch (error) {
    console.error("Error in getDashboardAction:", error);

    if (error instanceof Error && error.message === "User not found") {
      return {
        success: false,
        error: "User not found. Please complete onboarding.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data",
    };
  }
}
