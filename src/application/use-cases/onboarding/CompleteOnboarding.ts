import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { type ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { type IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { randomUUID } from "crypto";

/**
 * CompleteOnboarding Use Case
 *
 * Finalizes the onboarding process by:
 * 1. Migrating onboarding data to user profile
 * 2. Creating a career goal
 * 3. Generating a personalized roadmap
 * 4. Marking onboarding as complete
 * 5. Cleaning up onboarding progress
 *
 * @layer Application
 */
export class CompleteOnboarding {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly onboardingRepository: IOnboardingRepository,
    private readonly careerGoalRepository: ICareerGoalRepository,
    private readonly generateUserRoadmap: GenerateUserRoadmap,
  ) {}

  /**
   * Execute the use case
   *
   * Idempotent: Can be called multiple times safely.
   * If user already completed onboarding, returns early without error.
   *
   * @param userId - The user's unique identifier
   * @returns Promise that resolves when onboarding is complete
   */
  async execute(userId: string): Promise<void> {
    // 1. Get user from repository
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Check if onboarding already completed (idempotency check)
    if (user.onboardingCompleted) {
      console.log(
        "CompleteOnboarding: User already completed onboarding, skipping",
      );
      return; // Already done, nothing to do
    }

    // 3. Retrieve onboarding session
    const session = await this.onboardingRepository.findByUserId(userId);

    if (session) {
      console.log("CompleteOnboarding: Session data:", {
        currentStep: session.currentStep,
        dataKeys: Object.keys(session.data),
        userId: session.userId,
      });
    }

    if (!session) {
      throw new Error("Onboarding session not found");
    }

    const data = session.data;

    // 3. Extract profile data from onboarding session with runtime type validation
    const yearsExperience = this.validateNumber(data.yearsExperience, 0);
    const location = this.validateString(data.region, null);
    const isEntryLevel = yearsExperience === 0;
    const currentSeniority = this.determineSeniority(yearsExperience);

    // 4. Update user profile with onboarding data using domain method
    user.completeOnboarding(
      location,
      isEntryLevel,
      yearsExperience,
      currentSeniority,
    );

    // Save updated user
    await this.userRepository.save(user);

    // 5. Create career goal with validated data
    const targetRole = this.validateString(
      data.targetRole,
      "Software Developer",
    );
    const currentRole = this.validateString(data.currentRole, "Beginner");

    const careerGoal = CareerGoal.create(
      CareerGoalId.create(randomUUID()),
      UserId.create(userId),
      targetRole,
      currentRole,
    );

    await this.careerGoalRepository.save(careerGoal);

    // 6. Generate roadmap using AI with full context (CV, GitHub, experience)
    console.log("\n🚀 COMPLETE ONBOARDING: Generating roadmap");
    console.log(`  Goal ID: ${careerGoal.id.value}`);
    console.log(`  Current role: ${currentRole}`);
    console.log(`  Target role: ${targetRole}`);

    const experienceSummary = this.buildExperienceSummary(data);
    const cvText = this.validateOptionalString(data.resumeText);
    const githubUsername = this.validateOptionalString(data.githubUsername);

    console.log(`  Experience summary: ${experienceSummary ? "Yes" : "No"}`);
    console.log(`  CV text: ${cvText ? `Yes (${cvText.length} chars)` : "No"}`);
    console.log(`  GitHub username: ${githubUsername || "No"}`);

    // Use GenerateUserRoadmap which handles CV, GitHub, and all context
    await this.generateUserRoadmap.execute({
      goalId: careerGoal.id.value,
      currentRole,
      targetRole,
      experienceSummary,
      cvText, // Pass CV text extracted in Step5Import
      githubUsername,
    });

    console.log("✅ CompleteOnboarding: Roadmap generated successfully");

    // 8. Clean up onboarding session
    await this.onboardingRepository.delete(userId);
  }

  /**
   * Runtime type guard: Validates and coerces to number
   * @param value - Unknown value from onboarding data
   * @param defaultValue - Fallback if validation fails
   * @returns Validated number
   */
  private validateNumber(value: unknown, defaultValue: number): number {
    if (typeof value === "number" && !isNaN(value) && value >= 0) {
      return Math.floor(value); // Ensure integer
    }
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    return defaultValue;
  }

  /**
   * Runtime type guard: Validates and coerces to string or null
   * @param value - Unknown value from onboarding data
   * @param defaultValue - Fallback if validation fails (null allowed)
   * @returns Validated string or null
   */
  private validateString(value: unknown, defaultValue: null): string | null;
  private validateString(value: unknown, defaultValue: string): string;
  private validateString(
    value: unknown,
    defaultValue: string | null,
  ): string | null {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return defaultValue;
  }

  /**
   * Runtime type guard: Validates optional string
   * @param value - Unknown value from onboarding data
   * @returns Validated string or undefined
   */
  private validateOptionalString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    return undefined;
  }

  /**
   * Determines seniority level based on years of experience
   * Returns canonical values: "JUNIOR" | "MID" | "SENIOR" | null
   * Entry level (0 years) returns null (handled by isEntryLevel flag)
   */
  private determineSeniority(yearsExperience: number): string | null {
    if (yearsExperience === 0) return null; // Entry level - use isEntryLevel flag instead
    if (yearsExperience < 3) return "JUNIOR";
    if (yearsExperience < 7) return "MID";
    return "SENIOR"; // 7+ years including Lead/Staff
  }

  /**
   * Builds an experience summary from onboarding data
   */
  private buildExperienceSummary(data: Record<string, unknown>): string {
    const parts: string[] = [];

    if (data.currentRole) {
      parts.push(`Current role: ${data.currentRole}`);
    }

    if (data.yearsExperience !== undefined) {
      const years = data.yearsExperience as number;
      if (years === 0) {
        parts.push("Just starting out in tech");
      } else {
        parts.push(`${years} years of experience`);
      }
    }

    if (data.interests) {
      parts.push(`Interests: ${data.interests}`);
    }

    if (data.dislike) {
      parts.push(`Prefers to avoid: ${data.dislike}`);
    }

    return parts.join(". ");
  }
}
