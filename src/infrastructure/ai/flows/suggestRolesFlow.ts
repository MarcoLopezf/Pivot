import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IRoleRecommender,
  RoleRecommendation,
} from "@domain/learning/services/IRoleRecommender";
import { IJobRoleRepository } from "@domain/learning/repositories/IJobRoleRepository";
import { stripMarkdownCodeBlock, wrapUserContent } from "../utils";
import { z } from "zod";

const RoleSuggestionResponseSchema = z.object({
  recommendations: z
    .array(
      z.object({
        role: z.string().min(1),
        matchPercentage: z.number().min(0).max(100),
        reasoning: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(5),
});

/**
 * GenkitRoleRecommender
 *
 * Infrastructure adapter that implements IRoleRecommender using Google Genkit and Gemini.
 * This keeps AI implementation details isolated from the domain layer.
 *
 * Grounding: Suggestions are constrained to valid JobRole entities from the database.
 */
export class GenkitRoleRecommender implements IRoleRecommender {
  constructor(private readonly jobRoleRepository: IJobRoleRepository) {}

  async suggestRoles(
    interests: string,
    resumeText?: string,
  ): Promise<RoleRecommendation[]> {
    try {
      // Fetch valid job roles from database to ground AI suggestions
      const validRoles = await this.jobRoleRepository.findEnabled();
      const validRoleNames = validRoles.map((role) => role.name);

      if (validRoleNames.length === 0) {
        throw new Error("No valid job roles found in the database");
      }

      const prompt = this.buildPrompt(interests, resumeText, validRoleNames);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4o-mini"),
        prompt,
        config: {
          temperature: 0.7,
        },
      });

      const cleaned = stripMarkdownCodeBlock(text);

      let parsed: z.infer<typeof RoleSuggestionResponseSchema>;
      try {
        parsed = RoleSuggestionResponseSchema.parse(JSON.parse(cleaned));
      } catch {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: Failed to parse AI response as JSON. Raw output: ${text}`,
        );
      }

      const validRoleSet = new Set(validRoleNames);
      const invalidRoles = parsed.recommendations.filter(
        (rec) => !validRoleSet.has(rec.role),
      );

      if (invalidRoles.length > 0) {
        console.warn(
          "AI returned invalid role names:",
          invalidRoles.map((r) => r.role),
        );
        console.warn("Valid roles:", validRoleNames);
        throw new Error(
          "AI suggested roles not in database. This indicates a grounding failure.",
        );
      }

      return parsed.recommendations.slice(0, 3);
    } catch (error) {
      console.error("Error generating role suggestions:", error);
      throw new Error("Failed to generate role recommendations");
    }
  }

  /**
   * Build the prompt for the AI model
   * @param interests - User's stated interests
   * @param resumeText - Optional resume/CV text
   * @param validRoleNames - List of valid job role names from database
   */
  private buildPrompt(
    interests: string,
    resumeText: string | undefined,
    validRoleNames: string[],
  ): string {
    // Build context section with optional resume.
    // User-provided content is wrapped with wrapUserContent for prompt injection defense.
    let userContent = `User Interests: ${interests}`;

    if (resumeText) {
      userContent += `\n\nResume/CV Context:\n${resumeText.substring(0, 3000)}`;
    }

    const contextSection = wrapUserContent("user_profile", userContent);

    return `You are a career advisor for tech professionals. Based on the user's interests${resumeText ? " and resume" : ""}, recommend the top 3 matches from the provided "Valid Job Roles" list.

CRITICAL CONSTRAINT: You MUST suggest roles STRICTLY from this list. DO NOT invent new titles or variations.

Valid Job Roles:
${validRoleNames.join(", ")}

${contextSection}

For each suggested role, provide:
1. The role name - MUST be an EXACT MATCH from the "Valid Job Roles" list above (case-sensitive)
2. A match percentage (0-100) indicating how well their interests${resumeText ? " and background" : ""} align with this role
3. A brief reasoning (max 160 characters) explaining why this role is a good fit${resumeText ? " based on their experience" : ""} and what skills they should develop

Focus on realistic career transitions that align with their interests while offering growth opportunities. Consider both lateral moves and progressive career paths.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "recommendations": [
    {
      "role": "Exact Role Name From List",
      "matchPercentage": 85,
      "reasoning": "Brief explanation..."
    }
  ]
}

Return exactly 3 recommendations, ordered by match percentage (highest first).
REMINDER: Each "role" value MUST be an exact match from the Valid Job Roles list.`;
  }
}
