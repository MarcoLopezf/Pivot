import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * ICareerGoalRepository
 *
 * Repository interface (port) for CareerGoal aggregate.
 * Defines the contract for persisting and retrieving career goals.
 * Implementations live in the infrastructure layer.
 */
export interface ICareerGoalRepository {
  /**
   * Persist a career goal
   */
  save(careerGoal: CareerGoal): Promise<void>;

  /**
   * Find a career goal by its ID
   */
  findById(id: CareerGoalId): Promise<CareerGoal | null>;

  /**
   * Find all career goals for a specific user
   */
  findByUserId(userId: UserId): Promise<CareerGoal[]>;
}
