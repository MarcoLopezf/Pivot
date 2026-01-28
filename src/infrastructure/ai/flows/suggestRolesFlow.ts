import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IRoleRecommender,
  RoleRecommendation,
} from "@domain/learning/services/IRoleRecommender";

/**
 * Interface for AI response structure
 */
interface RoleSuggestionResponse {
  recommendations: Array<{
    role: string;
    matchPercentage: number;
    reasoning: string;
  }>;
}

/**
 * GenkitRoleRecommender
 *
 * Infrastructure adapter that implements IRoleRecommender using Google Genkit and Gemini.
 * This keeps AI implementation details isolated from the domain layer.
 */
export class GenkitRoleRecommender implements IRoleRecommender {
  async suggestRoles(
    currentRole: string,
    skills: string[],
  ): Promise<RoleRecommendation[]> {
    try {
      const prompt = this.buildPrompt(currentRole, skills);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4o-mini"),
        prompt,
        config: {
          temperature: 0.7,
        },
      });

      // Parse JSON response from the model
      const response: RoleSuggestionResponse = JSON.parse(text);

      if (!response.recommendations || response.recommendations.length === 0) {
        throw new Error("No recommendations received from AI model");
      }

      // Return top 3 recommendations
      return response.recommendations.slice(0, 3);
    } catch (error) {
      console.error("Error generating role suggestions:", error);
      throw new Error("Failed to generate role recommendations");
    }
  }

  /**
   * Build the prompt for the AI model
   */
  private buildPrompt(currentRole: string, skills: string[]): string {
    const skillsList = skills.join(", ");

    return `You are a career advisor for tech professionals. Based on the user's current role and skills, suggest 3 alternative tech career roles they could transition to.

Current Role: ${currentRole}
Skills: ${skillsList}

For each suggested role, provide:
1. The role name (clear and specific, e.g., "Frontend Developer", "DevOps Engineer")
2. A match percentage (0-100) indicating how well their current skills align with this role
3. A brief reasoning (2-3 sentences) explaining why this role is a good fit and what additional skills they might need

Focus on realistic career transitions that leverage their existing skills while offering growth opportunities. Consider both lateral moves and progressive career paths.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "recommendations": [
    {
      "role": "Role Name",
      "matchPercentage": 85,
      "reasoning": "Brief explanation..."
    }
  ]
}

Return exactly 3 recommendations, ordered by match percentage (highest first).`;
  }
}
