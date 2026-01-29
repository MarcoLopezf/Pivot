import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

/**
 * IRoadmapRepository
 *
 * Repository interface (port) for Roadmap aggregate.
 * Defines the contract for persisting and retrieving roadmaps with their items.
 * Implementations live in the infrastructure layer.
 */
export interface IRoadmapRepository {
  /**
   * Persist a roadmap with its items
   */
  save(roadmap: Roadmap): Promise<void>;

  /**
   * Find a roadmap by its ID (includes items)
   */
  findById(id: RoadmapId): Promise<Roadmap | null>;

  /**
   * Find all roadmaps for a specific career goal
   */
  findByGoalId(goalId: CareerGoalId): Promise<Roadmap[]>;
}
