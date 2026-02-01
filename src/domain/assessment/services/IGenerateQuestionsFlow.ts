/**
 * GeneratedQuestion
 *
 * Raw question data returned by the AI flow
 */
export interface GeneratedQuestion {
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

/**
 * IGenerateQuestionsFlow
 *
 * Domain service interface for AI-powered question generation.
 * This is a port - implementations (adapters) live in the infrastructure layer.
 */
export interface IGenerateQuestionsFlow {
  /**
   * Generate quiz questions based on topic and difficulty
   *
   * @param topic - The topic/tag for the questions (e.g., "react-hooks", "typescript-generics")
   * @param difficulty - The difficulty level ("beginner", "intermediate", "advanced")
   * @param count - Number of questions to generate
   * @returns Promise with array of generated questions with options
   */
  generate(
    topic: string,
    difficulty: string,
    count: number,
  ): Promise<GeneratedQuestion[]>;
}
