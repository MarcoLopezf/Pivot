import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaOnboardingRepository } from "@infrastructure/database/repositories/PrismaOnboardingRepository";
import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { SaveOnboardingStep } from "@application/use-cases/onboarding/SaveOnboardingStep";
import { GetOnboardingStatus } from "@application/use-cases/onboarding/GetOnboardingStatus";
import { CompleteOnboarding } from "@application/use-cases/onboarding/CompleteOnboarding";
import { profileContainer } from "@infrastructure/di/ProfileContainer";
import { learningContainer } from "@infrastructure/di/LearningContainer";

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
 * - SaveOnboardingStep use case for saving progress
 * - GetOnboardingStatus use case for retrieving progress
 * - CompleteOnboarding use case for finalizing onboarding
 *
 * @layer Infrastructure
 */
class OnboardingContainer {
  private _onboardingRepository: IOnboardingRepository;
  private _saveOnboardingStep: SaveOnboardingStep;
  private _getOnboardingStatus: GetOnboardingStatus;
  private _completeOnboarding: CompleteOnboarding;

  constructor() {
    // Initialize infrastructure dependencies
    this._onboardingRepository = new PrismaOnboardingRepository(prisma);

    // Initialize use cases with injected dependencies
    this._saveOnboardingStep = new SaveOnboardingStep(
      this._onboardingRepository,
      profileContainer.getUserRepository(),
    );
    this._getOnboardingStatus = new GetOnboardingStatus(
      this._onboardingRepository,
      profileContainer.getUserRepository(),
    );
    this._completeOnboarding = new CompleteOnboarding(
      profileContainer.getUserRepository(),
      this._onboardingRepository,
      learningContainer.getCareerGoalRepository(),
      learningContainer.getGenerateUserRoadmapUseCase(),
    );
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

  /**
   * Returns the SaveOnboardingStep use case instance
   *
   * Used by server actions and API routes to save onboarding progress
   */
  get saveOnboardingStep(): SaveOnboardingStep {
    return this._saveOnboardingStep;
  }

  /**
   * Returns the GetOnboardingStatus use case instance
   *
   * Used by server actions and API routes to retrieve onboarding progress
   */
  get getOnboardingStatus(): GetOnboardingStatus {
    return this._getOnboardingStatus;
  }

  /**
   * Returns the CompleteOnboarding use case instance
   *
   * Used by server actions to finalize the onboarding process
   */
  get completeOnboarding(): CompleteOnboarding {
    return this._completeOnboarding;
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const onboardingContainer = new OnboardingContainer();

export { onboardingContainer };
