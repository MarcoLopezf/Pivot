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
    interests: string,
    resumeText?: string,
  ): Promise<RoleRecommendation[]> {
    try {
      const prompt = this.buildPrompt(interests, resumeText);

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
  private buildPrompt(interests: string, resumeText?: string): string {
    // Build context section with optional resume
    let contextSection = `User Interests: ${interests}`;

    if (resumeText) {
      contextSection += `

Resume/CV Context:
${resumeText.substring(0, 3000)}`;
    }

    return `You are a career advisor for tech professionals. Based on the user's interests${resumeText ? " and resume" : ""}, suggest 3 alternative tech career roles they could pursue.

${contextSection}

For each suggested role, provide:
1. The role name (clear and specific, e.g., "Frontend Developer", "DevOps Engineer")
2. A match percentage (0-100) indicating how well their interests${resumeText ? " and background" : ""} align with this role
3. A brief reasoning (2-3 sentences) explaining why this role is a good fit${resumeText ? " based on their experience" : ""} and what skills they should develop

Focus on realistic career transitions that align with their interests while offering growth opportunities. Consider both lateral moves and progressive career paths.

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
