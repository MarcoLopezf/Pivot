"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { learningContainer } from "@infrastructure/di/LearningContainer";
import { CareerGoalDTO } from "@application/dtos/learning/CareerGoalDTO";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { JobRoleDTO } from "@application/dtos/learning/JobRoleDTO";
import { RoadmapOverviewDTO } from "@application/use-cases/learning/GetRoadmapById";
import { RoadmapItemDetailDTO } from "@application/use-cases/learning/GetRoadmapItemById";
import { LearningResource } from "@domain/learning/repositories/IResourceRepository";
import { PdfService } from "@infrastructure/services/PdfService";
import type { RoadmapListItemDTO } from "@application/use-cases/learning/GetUserRoadmaps";
import { saveStepAction } from "./onboarding";

/**
 * Server Action: Get User Roadmaps List
 *
 * Returns a lightweight list of all user roadmaps (id, title, role)
 * sorted by updatedAt desc. Used for the context switcher in the header.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only returns authenticated user's own roadmaps
 *
 * @returns Lightweight roadmap list or error
 *
 * @layer Interface (Web)
 */
export async function getUserRoadmapsListAction(): Promise<{
  success: boolean;
  data?: RoadmapListItemDTO[];
  error?: string;
}> {
  try {
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

    const getUserRoadmaps = learningContainer.getGetUserRoadmapsUseCase();
    const roadmaps = await getUserRoadmaps.execute(user.id);

    return {
      success: true,
      data: roadmaps,
    };
  } catch (error) {
    console.error("Error in getUserRoadmapsListAction:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load roadmaps list",
    };
  }
}

/**
 * Server Action: Get Last Active Roadmap ID
 *
 * Returns the ID of the most recently updated roadmap for the authenticated user.
 * Used for smart redirect on the root page.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Only returns authenticated user's own roadmap
 *
 * @returns Roadmap ID or null if none exists
 *
 * @layer Interface (Web)
 */
export async function getLastActiveRoadmapIdAction(): Promise<{
  success: boolean;
  data?: string | null;
  error?: string;
}> {
  try {
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

    const getLastActiveRoadmap =
      learningContainer.getGetLastActiveRoadmapUseCase();
    const roadmapId = await getLastActiveRoadmap.execute(user.id);

    return {
      success: true,
      data: roadmapId,
    };
  } catch (error) {
    console.error("Error in getLastActiveRoadmapIdAction:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get last active roadmap",
    };
  }
}

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

/**
 * Server Action: Get Role Suggestions
 *
 * Generates AI-powered career role suggestions based on user interests
 * and optional CV/resume upload. If a CV is uploaded, the extracted text
 * is persisted to onboarding step 4 for later use (avoiding double upload).
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Validates PDF file type
 * - Limits resume text to 3000 characters for AI context
 *
 * @param formData - Form data with interests (string) and optional cvFile (File)
 * @returns Role suggestions or error
 *
 * @layer Interface (Web)
 */
export async function getRoleSuggestionsAction(formData: FormData): Promise<{
  success: boolean;
  data?: Array<{ role: string; matchPercentage: number; reasoning: string }>;
  resumeText?: string;
  resumeFileName?: string;
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

    // 2. Extract interests (required)
    const interests = formData.get("interests");
    if (!interests || typeof interests !== "string" || !interests.trim()) {
      return {
        success: false,
        error: "Interests field is required",
      };
    }

    // 3. Extract and process optional CV file
    let resumeText: string | undefined;
    const cvFile = formData.get("cvFile");

    if (cvFile instanceof File && cvFile.size > 0) {
      console.log("\n🔵 DISCOVERY: CV file received");
      console.log(`  Filename: ${cvFile.name}`);
      console.log(`  File type: ${cvFile.type}`);
      console.log(
        `  File size: ${cvFile.size} bytes (${(cvFile.size / 1024).toFixed(2)} KB)`,
      );

      // Validate PDF
      if (cvFile.type !== "application/pdf") {
        console.error("❌ Invalid file type - must be PDF");
        return {
          success: false,
          error: "CV file must be a PDF",
        };
      }

      try {
        // Extract text from PDF
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const pdfService = new PdfService();
        resumeText = await pdfService.extractText(buffer);

        console.log(`✅ Extracted ${resumeText.length} characters from resume`);

        // CRITICAL: Persist resume text to Step 4 for later use (avoid double upload)
        const saveResult = await saveStepAction(4, {
          resumeText,
          fileName: cvFile.name,
        });

        if (!saveResult.success) {
          console.error(
            "⚠️ Failed to save resume to onboarding step:",
            saveResult.error,
          );
          // Continue anyway - we still have the text for suggestions
        } else {
          console.log("✅ Resume text saved to onboarding step 4");
        }
      } catch (pdfError) {
        console.error("❌ Failed to extract text from PDF:", pdfError);
        return {
          success: false,
          error: "Failed to process CV file. Please ensure it's a valid PDF.",
        };
      }
    } else {
      console.log(
        "ℹ️ No CV file provided - generating suggestions from interests only",
      );
    }

    // 4. Get use case from DI container
    const suggestCareerRoles = learningContainer.getSuggestCareerRolesUseCase();

    // 5. Execute use case with interests and optional resume text
    console.log("\n🚀 Calling SuggestCareerRoles use case");
    console.log(`  Interests: ${interests.substring(0, 100)}...`);
    console.log(`  Resume context: ${resumeText ? "Yes" : "No"}`);

    const suggestions = await suggestCareerRoles.execute({
      interests: interests.trim(),
      resumeText,
    });

    console.log(`✅ Generated ${suggestions.length} role suggestions`);

    return {
      success: true,
      data: suggestions,
      resumeText,
      resumeFileName: cvFile instanceof File ? cvFile.name : undefined,
    };
  } catch (error) {
    console.error("Error in getRoleSuggestionsAction:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate role suggestions",
    };
  }
}

/**
 * Server Action: Get Roadmap By ID
 *
 * Retrieves a specific roadmap by its ID with ownership verification.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Verifies roadmap ownership (only returns if user owns it)
 *
 * @param roadmapId - The roadmap ID to fetch
 * @returns Roadmap DTO or error
 *
 * @layer Interface (Web)
 */
export async function getRoadmapByIdAction(roadmapId: string): Promise<{
  success: boolean;
  data?: RoadmapOverviewDTO | null;
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

    // 2. Validate input
    if (!roadmapId || typeof roadmapId !== "string" || !roadmapId.trim()) {
      return {
        success: false,
        error: "Roadmap ID is required",
      };
    }

    // 3. Get use case from DI container
    const getRoadmapById = learningContainer.getGetRoadmapByIdUseCase();

    // 4. Execute use case (includes ownership check)
    const roadmapDTO = await getRoadmapById.execute(roadmapId, user.id);

    return {
      success: true,
      data: roadmapDTO,
    };
  } catch (error) {
    console.error("Error in getRoadmapByIdAction:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load roadmap",
    };
  }
}

/**
 * Server Action: Get Job Roles
 *
 * Retrieves curated job roles, optionally filtered by search query.
 * Returns only enabled roles sorted by popularity.
 *
 * Security:
 * - No authentication required (public data)
 * - Returns only enabled roles
 *
 * @param query - Optional search term to filter roles
 * @returns Job role DTOs or error
 *
 * @layer Interface (Web)
 */
export async function getJobRolesAction(query?: string): Promise<{
  success: boolean;
  data?: JobRoleDTO[];
  error?: string;
}> {
  try {
    // Get use case from DI container
    const getJobRoles = learningContainer.getGetJobRolesUseCase();

    // Execute use case
    const roles = await getJobRoles.execute(query);

    return {
      success: true,
      data: roles,
    };
  } catch (error) {
    console.error("Error in getJobRolesAction:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch job roles",
    };
  }
}

/**
 * Server Action: Get Roadmap Item
 *
 * Retrieves a single roadmap item with its learning resources.
 * Orchestrates two use cases: item fetch (with ownership check) + resource fetch.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Verifies roadmap ownership (only returns if user owns it)
 *
 * @param roadmapId - The roadmap ID
 * @param itemId - The item ID to fetch
 * @returns Item detail DTO with resources or error
 *
 * @layer Interface (Web)
 */
export async function getRoadmapItemAction(
  roadmapId: string,
  itemId: string,
): Promise<{
  success: boolean;
  data?: { detail: RoadmapItemDetailDTO; resources: LearningResource[] } | null;
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

    // 2. Validate inputs
    if (!roadmapId || !itemId) {
      return {
        success: false,
        error: "Roadmap ID and Item ID are required",
      };
    }

    // 3. Fetch item with ownership check
    const getItem = learningContainer.getGetRoadmapItemByIdUseCase();
    const detail = await getItem.execute(roadmapId, itemId, user.id);

    if (!detail) {
      return { success: true, data: null };
    }

    // 4. Fetch resources for the item's tags with difficulty context
    let resources: LearningResource[] = [];
    if (detail.item.tags && detail.item.tags.length > 0) {
      try {
        const getResources = learningContainer.getGetItemResourcesUseCase();
        resources = await getResources.execute(
          itemId,
          detail.item.tags,
          detail.item.difficulty,
        );
      } catch (resourceError) {
        // Resources are non-critical; log and continue
        console.error("Failed to fetch resources:", resourceError);
      }
    }

    return {
      success: true,
      data: { detail, resources },
    };
  } catch (error) {
    console.error("Error in getRoadmapItemAction:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load roadmap item",
    };
  }
}
