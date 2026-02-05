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

    // 3. Extract profile data from onboarding session
    const yearsExperience = (data.yearsExperience as number) || 0;
    const location = (data.region as string) || null;
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

    // 5. Create career goal
    const targetRole = (data.targetRole as string) || "Software Developer";
    const currentRole = (data.currentRole as string) || "Beginner";

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
    const cvText = data.resumeText as string | undefined;
    const githubUsername = data.githubUsername as string | undefined;

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
    // await this.onboardingRepository.delete(userId);
  }

  /**
   * Determines seniority level based on years of experience
   */
  private determineSeniority(yearsExperience: number): string {
    if (yearsExperience === 0) return "Entry Level";
    if (yearsExperience < 2) return "Junior";
    if (yearsExperience < 5) return "Mid-Level";
    if (yearsExperience < 8) return "Senior";
    return "Lead/Staff";
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
