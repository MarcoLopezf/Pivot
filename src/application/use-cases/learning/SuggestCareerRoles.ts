import { IRoleRecommender } from "@domain/learning/services/IRoleRecommender";

/**
 * Input DTO for role suggestions
 */
export interface SuggestCareerRolesDTO {
  interests: string;
  resumeText?: string;
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
 * to generate AI-powered career role suggestions for users based on
 * their interests and optional resume/CV context.
 */
export class SuggestCareerRoles {
  constructor(private readonly roleRecommender: IRoleRecommender) {}

  async execute(dto: SuggestCareerRolesDTO): Promise<RoleSuggestionDTO[]> {
    const recommendations = await this.roleRecommender.suggestRoles(
      dto.interests,
      dto.resumeText,
    );

    return recommendations.map((rec) => ({
      role: rec.role,
      matchPercentage: rec.matchPercentage,
      reasoning: rec.reasoning,
    }));
  }
}
