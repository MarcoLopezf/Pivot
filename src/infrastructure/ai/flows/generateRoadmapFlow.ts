import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IGenerateRoadmapFlow,
  GeneratedRoadmapItem,
} from "@domain/learning/services/IGenerateRoadmapFlow";

/**
 * Interface for AI response structure
 */
interface RoadmapGenerationResponse {
  items: Array<{
    title: string;
    description: string;
    order: number;
  }>;
}

/**
 * GenkitRoadmapFlow
 *
 * Infrastructure adapter that implements IGenerateRoadmapFlow using Genkit and OpenAI.
 * Generates a structured learning roadmap based on the user's career transition.
 */
export class GenkitRoadmapFlow implements IGenerateRoadmapFlow {
  async generate(
    currentRole: string,
    targetRole: string,
  ): Promise<GeneratedRoadmapItem[]> {
    try {
      const prompt = this.buildPrompt(currentRole, targetRole);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4o-mini"),
        prompt,
        config: {
          temperature: 0.7,
        },
      });

      const cleaned = this.stripMarkdownCodeBlock(text);

      let response: RoadmapGenerationResponse;
      try {
        response = JSON.parse(cleaned);
      } catch {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: Failed to parse AI response as JSON. Raw output: ${text}`,
        );
      }

      if (!response.items || response.items.length === 0) {
        throw new Error(
          "AI_RESPONSE_FORMAT_ERROR: No roadmap items received from AI model",
        );
      }

      return response.items.map((item) => ({
        title: item.title,
        description: item.description,
        order: item.order,
      }));
    } catch (error) {
      console.error("Error generating roadmap:", error);
      throw error;
    }
  }

  private stripMarkdownCodeBlock(raw: string): string {
    const trimmed = raw.trim();
    const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
    const match = codeBlockRegex.exec(trimmed);
    if (match) {
      return match[1].trim();
    }
    return trimmed;
  }

  private buildPrompt(currentRole: string, targetRole: string): string {
    return `You are a career development expert specializing in tech career transitions. Generate a structured learning roadmap for someone transitioning from "${currentRole}" to "${targetRole}".

Create 5-8 sequential learning milestones that form a clear path from current skills to the target role. Each milestone should be:
- Actionable and specific (not vague like "learn more")
- Building on the previous milestone
- Achievable within 2-4 weeks each

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "items": [
    {
      "title": "Clear, concise milestone title",
      "description": "2-3 sentence description of what to learn and why it matters for the transition",
      "order": 1
    }
  ]
}

Order items sequentially (1, 2, 3, ...) from foundational to advanced.`;
  }
}
