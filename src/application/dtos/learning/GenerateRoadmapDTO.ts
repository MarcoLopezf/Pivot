/**
 * GenerateRoadmapDTO - Input data for roadmap generation
 *
 * Enhanced with optional user context fields for personalized roadmap generation.
 * The AI will analyze user's experience to intelligently set initial task statuses.
 */
export interface GenerateRoadmapDTO {
  goalId: string;
  currentRole: string;
  targetRole: string;

  /**
   * Optional manual experience summary provided by the user
   * Example: "I have 3 years of experience with React and TypeScript..."
   */
  experienceSummary?: string;

  /**
   * Optional CV file as a Buffer for text extraction
   * Will be parsed to extract relevant skills and experience
   */
  cvFile?: Buffer;

  /**
   * Optional GitHub username for analyzing public repositories
   * The service will fetch recent repos and extract technical context
   */
  githubUsername?: string;
}
