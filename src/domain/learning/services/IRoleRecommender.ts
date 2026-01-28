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
   * Suggest career roles based on current role and skills
   *
   * @param currentRole - The user's current job role
   * @param skills - List of skills the user possesses
   * @returns Promise with array of recommended roles (max 3)
   */
  suggestRoles(
    currentRole: string,
    skills: string[],
  ): Promise<RoleRecommendation[]>;
}
