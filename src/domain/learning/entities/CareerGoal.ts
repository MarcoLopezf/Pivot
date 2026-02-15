import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * CareerGoal Entity
 *
 * Represents a user's career transition goal in the Learning bounded context.
 * Encapsulates the business logic related to setting and managing career objectives.
 */
export class CareerGoal {
  private readonly _id: CareerGoalId;
  private readonly _userId: UserId;
  private _targetRole: string;
  private _currentRole: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: CareerGoalId,
    userId: UserId,
    targetRole: string,
    currentRole: string,
    createdAt: Date,
  ) {
    this._id = id;
    this._userId = userId;
    this._targetRole = targetRole;
    this._currentRole = currentRole;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
  }

  /**
   * Factory method to create a new CareerGoal
   *
   * @param id - Unique identifier for the career goal
   * @param userId - User who owns this career goal
   * @param targetRole - The role the user wants to transition to
   * @param currentRole - The user's current role
   * @returns A new CareerGoal instance
   * @throws Error if targetRole or currentRole are empty
   */
  public static create(
    id: CareerGoalId,
    userId: UserId,
    targetRole: string,
    currentRole: string,
  ): CareerGoal {
    if (targetRole.trim().length === 0) {
      throw new Error("Target role cannot be empty");
    }
    if (currentRole.trim().length === 0) {
      throw new Error("Current role cannot be empty");
    }
    const now = new Date();
    return new CareerGoal(id, userId, targetRole, currentRole, now);
  }

  /**
   * Reconstitute a CareerGoal from persistence
   *
   * Used by repositories to rebuild entities from database records.
   */
  public static reconstitute(
    id: CareerGoalId,
    userId: UserId,
    targetRole: string,
    currentRole: string,
    createdAt: Date,
    updatedAt: Date,
  ): CareerGoal {
    const goal = new CareerGoal(id, userId, targetRole, currentRole, createdAt);
    goal._updatedAt = updatedAt;
    return goal;
  }

  public get id(): CareerGoalId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get targetRole(): string {
    return this._targetRole;
  }

  public get currentRole(): string {
    return this._currentRole;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Update the target role
   *
   * @param targetRole - The new target role
   * @throws Error if targetRole is empty
   */
  public updateTargetRole(targetRole: string): void {
    if (targetRole.trim().length === 0) {
      throw new Error("Target role cannot be empty");
    }
    this._targetRole = targetRole;
    this._updatedAt = new Date();
  }

  /**
   * Update the current role
   *
   * @param currentRole - The new current role
   * @throws Error if currentRole is empty
   */
  public updateCurrentRole(currentRole: string): void {
    if (currentRole.trim().length === 0) {
      throw new Error("Current role cannot be empty");
    }
    this._currentRole = currentRole;
    this._updatedAt = new Date();
  }
}
