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

      const response: RoadmapGenerationResponse = JSON.parse(text);

      if (!response.items || response.items.length === 0) {
        throw new Error("No roadmap items received from AI model");
      }

      return response.items.map((item) => ({
        title: item.title,
        description: item.description,
        order: item.order,
      }));
    } catch (error) {
      console.error("Error generating roadmap:", error);
      throw new Error("Failed to generate learning roadmap");
    }
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
