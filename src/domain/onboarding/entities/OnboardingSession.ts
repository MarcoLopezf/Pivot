import { DomainError } from "@domain/shared/errors/DomainError";

/**
 * OnboardingSession - Domain Entity
 *
 * Represents the state of a user's onboarding process.
 * This entity tracks the current step and accumulated data as the user
 * progresses through the onboarding flow.
 *
 * Steps are represented as integers (1, 2, 3, etc.) matching the database schema.
 *
 * @domain Onboarding
 * @layer Domain
 */
export class OnboardingSession {
  private readonly _userId: string;
  private _currentStep: number;
  private _data: Record<string, unknown>;
  private _updatedAt: Date;

  private constructor(
    userId: string,
    currentStep: number,
    data: Record<string, unknown>,
    updatedAt: Date,
  ) {
    this._userId = userId;
    this._currentStep = currentStep;
    this._data = data;
    this._updatedAt = updatedAt;
  }

  /**
   * Creates a new OnboardingSession for a user
   *
   * @param userId - The user's unique identifier
   * @param currentStep - The current onboarding step (1, 2, 3, etc.)
   * @param data - Accumulated onboarding data
   * @returns New OnboardingSession instance
   */
  public static create(
    userId: string,
    currentStep: number,
    data: Record<string, unknown> = {},
  ): OnboardingSession {
    if (!userId || userId.trim().length === 0) {
      throw new DomainError("User ID cannot be empty");
    }

    if (currentStep < 1) {
      throw new DomainError("Current step must be at least 1");
    }

    const now = new Date();
    return new OnboardingSession(userId, currentStep, data, now);
  }

  /**
   * Reconstitutes an OnboardingSession from persistence
   *
   * Used by repository to rebuild domain entity from database data
   */
  public static reconstitute(
    userId: string,
    currentStep: number,
    data: Record<string, unknown>,
    updatedAt: Date,
  ): OnboardingSession {
    return new OnboardingSession(userId, currentStep, data, updatedAt);
  }

  // Getters

  public get userId(): string {
    return this._userId;
  }

  public get currentStep(): number {
    return this._currentStep;
  }

  public get data(): Record<string, unknown> {
    return { ...this._data }; // Return copy to prevent external mutation
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business Logic Methods

  /**
   * Updates the current onboarding step
   *
   * @param step - The new step to move to (must be >= 1)
   */
  public updateStep(step: number): void {
    if (step < 1) {
      throw new DomainError("Step must be at least 1");
    }

    this._currentStep = step;
    this._updatedAt = new Date();
  }

  /**
   * Updates the onboarding data
   *
   * Merges new data with existing data
   *
   * @param newData - Partial data to merge
   */
  public updateData(newData: Record<string, unknown>): void {
    this._data = {
      ...this._data,
      ...newData,
    };
    this._updatedAt = new Date();
  }

  /**
   * Replaces all onboarding data
   *
   * @param data - New data to replace existing data
   */
  public setData(data: Record<string, unknown>): void {
    this._data = { ...data };
    this._updatedAt = new Date();
  }

  /**
   * Clears all onboarding data
   */
  public clearData(): void {
    this._data = {};
    this._updatedAt = new Date();
  }
}
