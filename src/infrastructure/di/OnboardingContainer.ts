import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaOnboardingRepository } from "@infrastructure/database/repositories/PrismaOnboardingRepository";
import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";

/**
 * OnboardingContainer - Dependency Injection Container for Onboarding bounded context
 *
 * This container follows the Composition Root pattern, wiring up dependencies
 * for the Onboarding domain. It ensures that:
 * - Database connections are reused (Prisma client singleton)
 * - Repositories are initialized once per container access
 * - Dependencies flow inward (Infrastructure -> Application -> Domain)
 *
 * Provides access to:
 * - OnboardingRepository for persisting onboarding session state
 *
 * @layer Infrastructure
 */
class OnboardingContainer {
  private _onboardingRepository: IOnboardingRepository;

  constructor() {
    // Initialize infrastructure dependencies
    this._onboardingRepository = new PrismaOnboardingRepository(prisma);
  }

  /**
   * Returns the onboarding repository instance
   *
   * Used by application layer (use cases) and API routes to access
   * onboarding session persistence
   */
  get onboardingRepository(): IOnboardingRepository {
    return this._onboardingRepository;
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const onboardingContainer = new OnboardingContainer();

export { onboardingContainer };
