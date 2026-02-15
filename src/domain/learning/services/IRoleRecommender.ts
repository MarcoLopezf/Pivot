/**
 * Role Recommendation Domain Model
 */
export interface RoleRecommendation {
  role: string;
  matchPercentage: number;
  reasoning: string;
}

/**
 * IRoleRecommender
 *
 * Domain service interface for AI-powered role recommendations.
 * This is a port - implementations (adapters) live in the infrastructure layer.
 * Keeps AI implementation details (Genkit, OpenAI, etc.) separate from business logic.
 */
export interface IRoleRecommender {
  /**
   * Suggest career roles based on user interests and optional resume text
   *
   * @param interests - User's career interests and aspirations
   * @param resumeText - Optional extracted text from user's CV/resume for context
   * @returns Promise with array of recommended roles (max 3)
   */
  suggestRoles(
    interests: string,
    resumeText?: string,
  ): Promise<RoleRecommendation[]>;
}
