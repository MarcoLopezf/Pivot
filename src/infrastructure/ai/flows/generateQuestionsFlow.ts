import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IGenerateQuestionsFlow,
  GeneratedQuestion,
} from "@domain/assessment/services/IGenerateQuestionsFlow";

/**
 * Interface for AI response structure
 */
interface QuestionGenerationResponse {
  questions: Array<{
    text: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

/**
 * GenkitQuestionsFlow
 *
 * Infrastructure adapter that implements IGenerateQuestionsFlow using Genkit and OpenAI.
 * Generates multiple-choice quiz questions for a given topic and difficulty level.
 */
export class GenkitQuestionsFlow implements IGenerateQuestionsFlow {
  async generate(
    topic: string,
    difficulty: string,
    count: number,
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = this.buildPrompt(topic, difficulty, count);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4o-mini"),
        prompt,
        config: {
          temperature: 0.8, // Higher temperature for diverse questions
        },
      });

      const cleaned = this.stripMarkdownCodeBlock(text);

      let response: QuestionGenerationResponse;
      try {
        response = JSON.parse(cleaned);
      } catch {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: Failed to parse AI response as JSON. Raw output: ${text}`,
        );
      }

      if (!response.questions || response.questions.length === 0) {
        throw new Error(
          "AI_RESPONSE_FORMAT_ERROR: No questions received from AI model",
        );
      }

      // Validate each question has exactly 4 options with exactly 1 correct
      for (const q of response.questions) {
        if (!q.options || q.options.length !== 4) {
          throw new Error(
            `AI_RESPONSE_FORMAT_ERROR: Question must have exactly 4 options. Got: ${q.options?.length ?? 0}`,
          );
        }
        const correctCount = q.options.filter((opt) => opt.isCorrect).length;
        if (correctCount !== 1) {
          throw new Error(
            `AI_RESPONSE_FORMAT_ERROR: Question must have exactly 1 correct answer. Got: ${correctCount}`,
          );
        }
      }

      return response.questions;
    } catch (error) {
      console.error("Error generating questions:", error);
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
    topic: string,
    difficulty: string,
    count: number,
  ): string {
    return `You are an expert educational content creator specializing in technical assessments. Generate ${count} high-quality multiple-choice quiz questions for the topic "${topic}" at "${difficulty}" difficulty level.

**CRITICAL REQUIREMENTS:**
- Each question must test practical understanding, not just memorization
- Questions should be clear, unambiguous, and technically accurate
- Each question must have EXACTLY 4 options (A, B, C, D)
- Each question must have EXACTLY 1 correct answer
- Incorrect options should be plausible but clearly wrong to someone who understands the topic
- Avoid trick questions or overly pedantic edge cases
- Questions should be relevant to real-world application of the topic

**DIFFICULTY GUIDELINES:**
- "beginner": Fundamental concepts, basic syntax, simple definitions
- "intermediate": Practical application, common patterns, best practices
- "advanced": Complex scenarios, performance considerations, edge cases, architectural decisions

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "questions": [
    {
      "text": "Clear question text here?",
      "options": [
        {
          "text": "First option",
          "isCorrect": false
        },
        {
          "text": "Second option",
          "isCorrect": true
        },
        {
          "text": "Third option",
          "isCorrect": false
        },
        {
          "text": "Fourth option",
          "isCorrect": false
        }
      ]
    }
  ]
}

Generate exactly ${count} questions now.`;
  }
}
