/**
 * Raw roadmap item data returned by the AI flow
 */
export interface GeneratedRoadmapItem {
  title: string;
  description: string;
  order: number;
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
   * @returns Promise with array of generated roadmap items
   */
  generate(
    currentRole: string,
    targetRole: string,
  ): Promise<GeneratedRoadmapItem[]>;
}
