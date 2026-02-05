"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { CareerGoalDTO } from "@application/dtos/learning/CareerGoalDTO";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

/**
 * Server Action: Create Career Goal and Generate Roadmap
 *
 * Creates a new career goal and automatically generates a personalized roadmap.
 * Handles optional CV file upload for enhanced AI context.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only allows users to create their own goals
 *
 * @param formData - Form data with targetRole, currentRole, optional experienceSummary, githubUsername, cvFile
 * @returns Career goal and roadmap DTOs or error
 *
 * @layer Interface (Web)
 */
export async function createCareerGoalAction(formData: FormData): Promise<{
  success: boolean;
  data?: { goal: CareerGoalDTO; roadmap: RoadmapDTO };
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

    // 2. Extract and validate required fields
    const targetRole = formData.get("targetRole");
    const currentRole = formData.get("currentRole");

    if (
      !targetRole ||
      !currentRole ||
      typeof targetRole !== "string" ||
      typeof currentRole !== "string"
    ) {
      return {
        success: false,
        error: "targetRole and currentRole are required",
      };
    }

    // 3. Extract optional fields
    const experienceSummary = formData.get("experienceSummary");
    const githubUsername = formData.get("githubUsername");
    const cvFile = formData.get("cvFile");

    const experienceSummaryStr =
      experienceSummary && typeof experienceSummary === "string"
        ? experienceSummary.trim()
        : undefined;

    const githubUsernameStr =
      githubUsername && typeof githubUsername === "string"
        ? githubUsername.trim()
        : undefined;

    // 4. Convert File to Buffer if present
    let cvBuffer: Buffer | undefined;
    if (cvFile instanceof File) {
      console.log("\n🔵 SERVER ACTION: CV file received from client");
      console.log(`  Filename: ${cvFile.name}`);
      console.log(`  File type: ${cvFile.type}`);
      console.log(
        `  File size: ${cvFile.size} bytes (${(cvFile.size / 1024).toFixed(2)} KB)`,
      );

      if (cvFile.type !== "application/pdf") {
        console.error("❌ Invalid file type - must be PDF");
        return {
          success: false,
          error: "CV file must be a PDF",
        };
      }

      const arrayBuffer = await cvFile.arrayBuffer();
      cvBuffer = Buffer.from(arrayBuffer);
      console.log(`✅ CV converted to buffer (${cvBuffer.length} bytes)`);
    } else {
      console.log("ℹ️ No CV file in FormData");
    }

    // 5. Get use cases from DI container
    const setCareerGoal = learningContainer.getSetCareerGoalUseCase();
    const generateUserRoadmap =
      learningContainer.getGenerateUserRoadmapUseCase();

    // 6. Create career goal
    const careerGoalDTO = await setCareerGoal.execute({
      userId: user.id,
      targetRole,
      currentRole,
    });

    // 7. Generate roadmap
    let roadmapDTO: RoadmapDTO;
    try {
      console.log("\n🚀 Calling GenerateUserRoadmap use case");
      console.log(`  Current role: ${currentRole}`);
      console.log(`  Target role: ${targetRole}`);
      console.log(
        `  Experience summary: ${experienceSummaryStr ? "Yes" : "No"}`,
      );
      console.log(`  GitHub username: ${githubUsernameStr || "None"}`);
      console.log(
        `  CV buffer: ${cvBuffer ? `Yes (${cvBuffer.length} bytes)` : "No"}`,
      );

      roadmapDTO = await generateUserRoadmap.execute({
        goalId: careerGoalDTO.id,
        currentRole,
        targetRole,
        experienceSummary: experienceSummaryStr,
        githubUsername: githubUsernameStr,
        cvFile: cvBuffer,
      });

      console.log("✅ Roadmap generated successfully");
    } catch (roadmapError) {
      console.error("❌ Failed to generate roadmap:", roadmapError);
      return {
        success: false,
        error:
          "Career goal saved, but roadmap generation failed. Please try again.",
      };
    }

    return {
      success: true,
      data: {
        goal: careerGoalDTO,
        roadmap: roadmapDTO,
      },
    };
  } catch (error) {
    console.error("Error in createCareerGoalAction:", error);

    if (
      error instanceof Error &&
      (error.message.includes("cannot be empty") ||
        error.message.includes("Invalid"))
    ) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create career goal",
    };
  }
}

/**
 * Server Action: Get User Roadmap
 *
 * Retrieves the authenticated user's learning roadmap.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only returns authenticated user's own roadmap
 *
 * @returns Roadmap DTO or null if not found
 *
 * @layer Interface (Web)
 */
export async function getUserRoadmapAction(): Promise<{
  success: boolean;
  data?: RoadmapDTO | null;
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
    const getUserRoadmap = learningContainer.getGetUserRoadmapUseCase();

    // 3. Execute use case
    const roadmapDTO = await getUserRoadmap.execute(user.id);

    return {
      success: true,
      data: roadmapDTO,
    };
  } catch (error) {
    console.error("Error in getUserRoadmapAction:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load roadmap data",
    };
  }
}
