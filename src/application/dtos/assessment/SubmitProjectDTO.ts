/**
 * SubmitProjectInputDTO
 *
 * Input for submitting a project for validation.
 * userId must be the authenticated user — verified against roadmap ownership in the use case.
 */
export interface SubmitProjectInputDTO {
  userId: string;
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
