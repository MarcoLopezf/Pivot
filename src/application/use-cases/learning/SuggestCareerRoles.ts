import { IRoleRecommender } from "@domain/learning/services/IRoleRecommender";

/**
 * Input DTO for role suggestions
 */
export interface SuggestCareerRolesDTO {
  currentRole: string;
  skills: string[];
}

/**
 * Output DTO for role suggestions
 */
export interface RoleSuggestionDTO {
  role: string;
  matchPercentage: number;
  reasoning: string;
}

/**
 * SuggestCareerRoles Use Case
 *
 * Application service that uses the IRoleRecommender domain service
 * to generate AI-powered career role suggestions for users.
 */
export class SuggestCareerRoles {
  constructor(private readonly roleRecommender: IRoleRecommender) {}

  async execute(dto: SuggestCareerRolesDTO): Promise<RoleSuggestionDTO[]> {
    const recommendations = await this.roleRecommender.suggestRoles(
      dto.currentRole,
      dto.skills,
    );

    return recommendations.map((rec) => ({
      role: rec.role,
      matchPercentage: rec.matchPercentage,
      reasoning: rec.reasoning,
    }));
  }
}
