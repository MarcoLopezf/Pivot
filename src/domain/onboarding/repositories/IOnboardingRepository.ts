import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

/**
 * IOnboardingRepository - Repository Port
 *
 * Defines the contract for persisting and retrieving onboarding session state.
 * This is a port (interface) in the hexagonal architecture, allowing the domain
 * to remain independent of infrastructure concerns.
 *
 * Implementations (adapters) will be in the infrastructure layer.
 *
 * @domain Onboarding
 * @layer Domain
 */
export interface IOnboardingRepository {
  /**
   * Persists an onboarding session
   *
   * Creates a new session if it doesn't exist, updates if it does.
   *
   * @param session - The onboarding session to save
   */
  save(session: OnboardingSession): Promise<void>;

  /**
   * Retrieves an onboarding session by user ID
   *
   * @param userId - The user's unique identifier
   * @returns The onboarding session if found, null otherwise
   */
  findByUserId(userId: string): Promise<OnboardingSession | null>;

  /**
   * Deletes an onboarding session
   *
   * Used when onboarding is completed or needs to be reset
   *
   * @param userId - The user's unique identifier
   */
  delete(userId: string): Promise<void>;
}
