/**
 * SubmitProjectInputDTO
 *
 * Input for submitting a project for validation.
 * Note: userId is obtained from roadmap ownership (Roadmap -> CareerGoal -> User)
 */
export interface SubmitProjectInputDTO {
  roadmapId: string;
  roadmapItemId: string;
  repoUrl: string;
}

/**
 * ProjectResultDTO
 *
 * Result returned after analyzing a project submission
 */
export interface ProjectResultDTO {
  submissionId: string;
  score: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
