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
    status: "pending" | "in_progress" | "completed";
    type: "theory" | "project";
    topic: string;
    difficulty: "beginner" | "intermediate" | "advanced";
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
    userContext?: string,
  ): Promise<GeneratedRoadmapItem[]> {
    try {
      const prompt = this.buildPrompt(currentRole, targetRole, userContext);

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
        status: item.status,
        type: item.type,
        topic: item.topic,
        difficulty: item.difficulty,
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

  private buildPrompt(
    currentRole: string,
    targetRole: string,
    userContext?: string,
  ): string {
    let contextSection = "";
    console.log("userContext", userContext);
    if (userContext) {
      contextSection = `

IMPORTANT - USER CONTEXT:
The user has provided the following information about their experience and background:

${userContext}

**CRITICAL INSTRUCTIONS FOR STATUS ASSIGNMENT:**
- Analyze the user context carefully to understand what skills/topics they already know
- Set "status" for each roadmap item based on their experience:
  * "completed": User demonstrates clear experience with this topic (e.g., "I use React daily", "3 years with TypeScript")
  * "in_progress": User has some exposure or basic knowledge (e.g., "learning React", "familiar with the basics")
  * "pending": No evidence of knowledge/experience with this topic - they need to learn it from scratch

- Tailor each item's description to fill THEIR SPECIFIC GAPS
- If they already know something, acknowledge it in the description and focus on advanced aspects`;
    } else {
      contextSection = `

NOTE: No user context provided. Set all items to "status": "pending" by default.`;
    }

    return `You are an expert career mentor specializing in personalized tech career transitions. Generate a structured learning roadmap for someone transitioning from "${currentRole}" to "${targetRole}".${contextSection}

Create 5-8 sequential learning milestones that form a clear path from current skills to the target role. Each milestone should be:
- Actionable and specific (not vague like "learn more")
- Building on the previous milestone
- Achievable within 2-4 weeks each
- **Status assigned based on user's existing knowledge**

**ITEM CLASSIFICATION RULES:**
- "type": Classify each item as either:
  * "theory": Knowledge-based learning (concepts, patterns, fundamentals) — validated later via quiz
  * "project": Hands-on practice (build something, implement a feature) — validated later via URL submission
  * A good roadmap should have a MIX of both types (roughly 80% theory, 20% project)
- "topic": A short, lowercase, kebab-case tag that describes the core subject (e.g., "typescript-generics", "react-hooks", "system-design", "docker-basics"). This tag is used to match quiz questions later.
- "difficulty": One of "beginner", "intermediate", or "advanced" based on the complexity of the milestone.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "items": [
    {
      "title": "Clear, concise milestone title",
      "description": "2-3 sentence description tailored to user's specific gaps. If they know basics, focus on advanced concepts.",
      "order": 1,
      "status": "pending",
      "type": "theory",
      "topic": "topic-tag",
      "difficulty": "beginner"
    }
  ]
}

Order items sequentially (1, 2, 3, ...) from foundational to advanced.
REMEMBER: Use the user context to intelligently set status values. Ensure a healthy mix of theory and project items.`;
  }
}
