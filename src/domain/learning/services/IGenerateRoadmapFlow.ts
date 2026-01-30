import type { RoadmapItemStatus } from "@domain/learning/entities/RoadmapItem";
import type { RoadmapItemType } from "@domain/learning/entities/RoadmapItem";

/**
 * Raw roadmap item data returned by the AI flow
 */
export interface GeneratedRoadmapItem {
  title: string;
  description: string;
  order: number;
  /**
   * Initial status set by AI based on user's experience
   * - 'completed': User already has this skill
   * - 'in_progress': User has some exposure
   * - 'pending': User needs to learn this
   */
  status: RoadmapItemStatus;
  /**
   * Type of the roadmap item
   * - 'theory': Knowledge-based, validated via quiz
   * - 'project': Hands-on, validated via URL submission
   */
  type: RoadmapItemType;
  /**
   * Topic tag used for question pool matching
   */
  topic: string;
  /**
   * Difficulty level for the item
   */
  difficulty: string;
}

/**
 * IGenerateRoadmapFlow
 *
 * Domain service interface for AI-powered roadmap generation.
 * This is a port - implementations (adapters) live in the infrastructure layer.
 * Keeps AI implementation details (Genkit, Gemini, etc.) separate from business logic.
 */
export interface IGenerateRoadmapFlow {
  /**
   * Generate a list of roadmap items based on the user's career transition
   *
   * @param currentRole - The user's current job role
   * @param targetRole - The role the user wants to transition to
   * @param userContext - Optional context about user's experience (from CV or manual input)
   * @returns Promise with array of generated roadmap items with intelligent status
   */
  generate(
    currentRole: string,
    targetRole: string,
    userContext?: string,
  ): Promise<GeneratedRoadmapItem[]>;
}
