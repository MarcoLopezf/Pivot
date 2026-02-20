/**
 * SubmitQuizAnswerDTO
 *
 * Single answer submitted by the user
 */
export interface SubmitQuizAnswerDTO {
  questionId: string;
  selectedOptionId: string;
}

/**
 * SubmitQuizInputDTO
 *
 * Input for submitting quiz answers.
 * userId must be the authenticated user — verified against roadmap ownership in the use case.
 */
export interface SubmitQuizInputDTO {
  userId: string;
  roadmapId: string;
  roadmapItemId: string;
  answers: SubmitQuizAnswerDTO[];
}

/**
 * QuizResultDTO
 *
 * Result returned after grading a quiz submission
 */
export interface QuizResultDTO {
  attemptId: string;
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  feedback: string;
}
