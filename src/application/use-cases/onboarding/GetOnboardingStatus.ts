import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { type IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * GetOnboardingStatus Use Case
 *
 * Retrieves the user's current onboarding progress from the database.
 * Used to restore the onboarding state when a user returns to the flow.
 *
 * Smart Skip Logic:
 * - If a session exists, return it as-is.
 * - If NO session exists, check user profile completeness:
 *   - If profile is complete (name + location) → create session at Step 2, pre-filled.
 *   - If profile is incomplete → create session at Step 1 with whatever data exists.
 *
 * @layer Application
 */
export class GetOnboardingStatus {
  constructor(
    private readonly onboardingRepository: IOnboardingRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param userId - The user's unique identifier
   * @returns The onboarding session if found, null otherwise
   */
  async execute(userId: string): Promise<OnboardingSession | null> {
    // Validate input
    if (!userId || userId.trim() === "") {
      throw new Error("User ID is required");
    }

    // 1. Try to find existing session
    const session = await this.onboardingRepository.findByUserId(userId);

    if (session) {
      return session;
    }

    // 2. No session found — check user profile for Smart Skip
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      return null;
    }

    const isProfileComplete = !!(user.name && user.location);

    const preFilledData: Record<string, unknown> = {};
    if (user.name) preFilledData.name = user.name;
    if (user.location) preFilledData.region = user.location;
    if (user.bio) preFilledData.bio = user.bio;

    if (isProfileComplete) {
      // Profile complete → start at Step 2, pre-filled with existing data
      const newSession = OnboardingSession.create(userId, 2, preFilledData);
      await this.onboardingRepository.save(newSession);
      return newSession;
    }

    // Profile incomplete → start at Step 1 with whatever data exists
    const newSession = OnboardingSession.create(userId, 1, preFilledData);
    await this.onboardingRepository.save(newSession);
    return newSession;
  }
}
