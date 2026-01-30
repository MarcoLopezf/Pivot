/**
 * QuizOptionDTO
 *
 * Single option for a quiz question.
 * IMPORTANT: Does NOT include isCorrect flag to prevent cheating.
 */
export interface QuizOptionDTO {
  id: string;
  text: string;
}

/**
 * QuizQuestionDTO
 *
 * Single question in a quiz with its options.
 */
export interface QuizQuestionDTO {
  id: string;
  text: string;
  options: QuizOptionDTO[];
}

/**
 * QuizDTO
 *
 * Complete quiz for a roadmap item.
 * Used to send quiz data to the frontend without exposing correct answers.
 */
export interface QuizDTO {
  roadmapItemId: string;
  title: string;
  difficulty: string;
  questions: QuizQuestionDTO[];
}
