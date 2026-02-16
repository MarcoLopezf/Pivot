import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IGenerateRoadmapFlow,
  GeneratedRoadmapItem,
} from "@domain/learning/services/IGenerateRoadmapFlow";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

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
    tags: string[];
    difficulty: DifficultyLevel;
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
        status: item.type === "project" ? "pending" : item.status,
        type: item.type,
        tags: item.tags,
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
  * "completed": User demonstrates clear experience with this topic (e.g., "I use React daily", "3 years with TypeScript") — ONLY for "theory" items
  * "in_progress": User has some exposure or basic knowledge (e.g., "learning React", "familiar with the basics") — ONLY for "theory" items
  * "pending": No evidence of knowledge/experience with this topic - they need to learn it from scratch
- **IMPORTANT: Items with "type": "project" MUST ALWAYS have "status": "pending"**. Only "theory" items can be "in_progress" or "completed".

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

**CRITICAL RULES FOR PROJECT-TYPE ITEMS:**
For items where "type": "project", follow these strict rules:

1. TITLE RULES:
   - Must be the name of a concrete application or module to build
   - GOOD examples: "Weather API", "Task Dashboard", "Blog Engine", "Authentication Service", "E-commerce Checkout"
   - BAD examples: "Learn React by Building", "Practice with a Project", "Understand APIs", "API Development Exercise"
   - Never use learning verbs: "Learn", "Study", "Understand", "Practice", "Master", "Explore"

2. DESCRIPTION RULES:
   - Must describe the business problem to solve and the expected outcome
   - Focus on WHAT to build and WHY it matters, not HOW to learn
   - Include enough technical detail so this description can later generate specific requirements, technologies, and implementation instructions
   - GOOD example: "Build a RESTful API that fetches real-time weather data from external providers, implements caching with Redis, handles rate limiting, and provides error responses for invalid locations. Must support multiple cities and return 7-day forecasts."
   - BAD example: "Learn about APIs by creating a weather app. This project will help you understand REST principles and practice HTTP requests."
   - Forbidden phrases: "This will help you", "You will learn", "Practice your skills", "Understand how X works"

3. DETAIL LEVEL:
   - Descriptions should be 3-5 sentences with specific requirements
   - Mention key technical aspects (data sources, performance requirements, edge cases)
   - The description will be used to generate a detailed project specification later

- "tags": **CRITICAL - ATOMIC TAG ARRAY RULES:**
  * Provide an array of atomic, single-concept tags that describe the specific skills/concepts covered
  * The NUMBER of tags depends on the item's difficulty level:
    - "beginner" items: 1-2 tags (focused, foundational) e.g. ["react"] or ["react", "components"]
    - "intermediate" items: 2-3 tags (more specific) e.g. ["react", "hooks", "state"]
    - "advanced" items: 3-4 tags (interconnected concepts) e.g. ["react-native", "native-modules", "ios", "android"]
  * Each tag must be a single concept (e.g., "react", "typescript", "docker", "hooks", "native-modules")
  * Tags MUST differentiate items covering the same broad technology (e.g., ["react", "hooks", "state"] vs ["react", "routing", "navigation"])
  * NO difficulty words (never: "react-basics", "advanced-typescript", "intro-to-python")
  * NO compound tags (never: "react-hooks-basics", "nodejs-tutorial")
  * Use canonical names: "react" (not "reactjs"), "node" (not "nodejs"), "postgres" (not "postgresql")
  * Examples of GOOD tags: ["react", "hooks", "state"], ["typescript", "generics"], ["docker", "containers", "deployment"]
  * Examples of BAD tags: ["react-basics"], ["reactjs"], ["intro-to-react"]
- "difficulty": One of "beginner", "intermediate", or "advanced" based on the complexity of the milestone.

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "items": [
    {
      "title": "React Fundamentals",
      "description": "Core concepts of React including JSX syntax, component composition, and props. Understanding the virtual DOM and React's rendering model.",
      "order": 1,
      "status": "pending",
      "type": "theory",
      "tags": ["react"],
      "difficulty": "beginner"
    },
    {
      "title": "React Hooks & State Management",
      "description": "Deep dive into useState, useEffect, useContext and custom hooks. Covers effect dependencies, cleanup functions, and common pitfalls with state updates.",
      "order": 2,
      "status": "pending",
      "type": "theory",
      "tags": ["react", "hooks", "state"],
      "difficulty": "intermediate"
    },
    {
      "title": "Real-time Kanban Board",
      "description": "Build a collaborative task management application with drag-and-drop functionality. Must support multiple boards, real-time updates across users using WebSockets, task assignment, and persist data to a database. Include filtering by assignee and status.",
      "order": 3,
      "status": "pending",
      "type": "project",
      "tags": ["react", "websockets", "drag-and-drop", "real-time"],
      "difficulty": "advanced"
    }
  ]
}

Order items sequentially (1, 2, 3, ...) from foundational to advanced.
REMEMBER: Use the user context to intelligently set status values. Ensure a healthy mix of theory and project items. For project items, use concrete deliverable names and problem-focused descriptions with sufficient technical detail.`;
  }
}
