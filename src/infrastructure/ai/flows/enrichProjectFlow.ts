import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IProjectEnrichmentFlow,
  GeneratedProjectDetails,
} from "@domain/learning/services/IProjectEnrichmentFlow";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

/**
 * Interface for AI response structure
 */
interface ProjectEnrichmentResponse {
  acceptanceCriteria: string[];
  technicalStack: string[];
  keyConcepts: string[];
}

/**
 * GenkitProjectEnrichmentFlow
 *
 * Infrastructure adapter that implements IProjectEnrichmentFlow using Genkit and OpenAI.
 * Generates acceptance criteria, technical stack, and key concepts for project-type
 * roadmap items to replace mock data with AI-tailored specifications.
 */
export class GenkitProjectEnrichmentFlow implements IProjectEnrichmentFlow {
  async enrich(
    title: string,
    description: string,
    tags: string[],
    difficulty: DifficultyLevel,
  ): Promise<GeneratedProjectDetails> {
    try {
      const prompt = this.buildPrompt(title, description, tags, difficulty);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4o-mini"),
        prompt,
        config: {
          temperature: 0.7,
        },
      });

      const cleaned = this.stripMarkdownCodeBlock(text);

      let response: ProjectEnrichmentResponse;
      try {
        response = JSON.parse(cleaned);
      } catch {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: Failed to parse project enrichment response as JSON. Raw output: ${text}`,
        );
      }

      // Validate structure
      if (
        !Array.isArray(response.acceptanceCriteria) ||
        response.acceptanceCriteria.length < 3
      ) {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: acceptanceCriteria must be an array with at least 3 items. Got: ${response.acceptanceCriteria?.length ?? 0}`,
        );
      }

      if (
        !Array.isArray(response.technicalStack) ||
        response.technicalStack.length < 2
      ) {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: technicalStack must be an array with at least 2 items. Got: ${response.technicalStack?.length ?? 0}`,
        );
      }

      if (
        !Array.isArray(response.keyConcepts) ||
        response.keyConcepts.length < 2
      ) {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: keyConcepts must be an array with at least 2 items. Got: ${response.keyConcepts?.length ?? 0}`,
        );
      }

      return {
        acceptanceCriteria: response.acceptanceCriteria.slice(0, 6),
        technicalStack: response.technicalStack.slice(0, 8),
        keyConcepts: response.keyConcepts.slice(0, 5),
      };
    } catch (error) {
      console.error("Error enriching project details:", error);
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
    title: string,
    description: string,
    tags: string[],
    difficulty: DifficultyLevel,
  ): string {
    return `You are an expert software engineering educator creating detailed project specifications for students.

PROJECT CONTEXT:
- Title: "${title}"
- Description: "${description}"
- Tags/Technologies: ${tags.join(", ")}
- Difficulty Level: ${difficulty}

TASK: Generate comprehensive project details with three sections:

1. ACCEPTANCE CRITERIA (4-6 specific, measurable criteria):
   - Each criterion must be specific, actionable, and verifiable
   - Focus on core functionality the student must deliver
   - Match the difficulty level (${difficulty}):
     * beginner: Focus on basic CRUD, simple UI, core functionality
     * intermediate: Include authentication, validation, error handling, API integration
     * advanced: Include performance optimization, security, scalability, testing
   - Write as imperative statements (e.g., "Implement user authentication with secure session management")
   - DO NOT use vague language like "should work well" or "must be good"

2. TECHNICAL STACK (3-8 specific technologies):
   - Base it on the tags provided: ${tags.join(", ")}
   - Include specific tools: programming language, framework, database, testing tools
   - Be specific with versions or variants when helpful (e.g., "Flask 2.x" not just "Python")
   - Only include technologies directly relevant to the project

3. KEY CONCEPTS (3-5 concepts to study/apply):
   - Concepts the student should research or understand to complete the project
   - Focus on patterns, principles, and techniques (e.g., "RESTful API design", "JWT authentication", "Input validation")
   - These help the student know WHAT to study, bridging the gap between "what to build" and "how to think about it"
   - Match complexity to the difficulty level

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "acceptanceCriteria": [
    "Implement user registration and login with email/password authentication",
    "Create full CRUD operations for tasks with proper REST API endpoints",
    "Include input validation on both client and server side",
    "Display tasks in a responsive list view with filtering by status"
  ],
  "technicalStack": [
    "JavaScript (ES6+)",
    "Flask 2.x",
    "SQLite",
    "HTML5 + CSS3",
    "Fetch API"
  ],
  "keyConcepts": [
    "RESTful API design",
    "Client-server architecture",
    "Input validation and sanitization",
    "CRUD operations"
  ]
}`;
  }
}
