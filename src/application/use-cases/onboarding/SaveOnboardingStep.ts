import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { type IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * SaveOnboardingStep Use Case
 *
 * Saves the user's current onboarding progress to the database.
 * This allows users to resume their onboarding flow if they leave
 * and come back later.
 *
 * When saving Step 1, also persists profile data (name, location, bio)
 * to the permanent User table so it survives session cleanup.
 *
 * @layer Application
 */
export class SaveOnboardingStep {
  constructor(
    private readonly onboardingRepository: IOnboardingRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param userId - The user's unique identifier
   * @param step - The current step number (1-6)
   * @param data - Partial onboarding data collected so far
   * @returns Promise that resolves when saved successfully
   */
  async execute(
    userId: string,
    step: number,
    data: Record<string, unknown>,
  ): Promise<void> {
    // Validate inputs
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    if (step < 1 || step > 6) {
      throw new Error("Step must be between 1 and 6");
    }

    // Persist profile data to User table on Step 1
    if (step === 1) {
      await this.persistProfileData(userId, data);
    }

    // Create or update onboarding session
    const session = OnboardingSession.create(userId, step, data);

    // Persist to database
    await this.onboardingRepository.save(session);
  }

  /**
   * Extract and persist profile fields from Step 1 data to the User table
   */
  private async persistProfileData(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) return;

    const name =
      typeof data.name === "string" && data.name.trim().length > 0
        ? data.name.trim()
        : user.name;
    const location =
      typeof data.region === "string" && data.region.trim().length > 0
        ? data.region.trim()
        : null;
    const bio =
      typeof data.bio === "string" && data.bio.trim().length > 0
        ? data.bio.trim()
        : null;

    user.updateProfile(name, location, bio);
    await this.userRepository.save(user);
  }
}
