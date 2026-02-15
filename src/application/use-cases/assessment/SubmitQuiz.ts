import { IQuestionRepository } from "@domain/assessment/repositories/IQuestionRepository";
import { IQuizAttemptRepository } from "@domain/assessment/repositories/IQuizAttemptRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import {
  SubmitQuizInputDTO,
  QuizResultDTO,
} from "@application/dtos/assessment/SubmitQuizDTO";
import { randomUUID } from "crypto";

/**
 * SubmitQuiz Use Case
 *
 * Grades user answers for a quiz and records the attempt.
 * If the user passes (≥70%), marks the roadmap item as completed.
 *
 * Flow:
 * 1. Fetch questions from DB to get correct answers
 * 2. Compare user answers with correct options
 * 3. Calculate score
 * 4. Create and persist QuizAttempt
 * 5. If passed, update RoadmapItem status to "completed"
 */
export class SubmitQuiz {
  constructor(
    private readonly questionRepository: IQuestionRepository,
    private readonly quizAttemptRepository: IQuizAttemptRepository,
    private readonly roadmapRepository: IRoadmapRepository,
  ) {}

  async execute(input: SubmitQuizInputDTO): Promise<QuizResultDTO> {
    const { roadmapId, roadmapItemId, answers } = input;

    // Validate input
    if (answers.length === 0) {
      throw new Error("VALIDATION_ERROR: No answers provided");
    }

    // Get userId from roadmap ownership (Roadmap -> CareerGoal -> User)
    const roadmapIdVO = RoadmapId.create(roadmapId);
    const ownerUserId =
      await this.roadmapRepository.findOwnerUserId(roadmapIdVO);
    if (!ownerUserId) {
      throw new Error("VALIDATION_ERROR: Roadmap not found or has no owner");
    }

    // 1. Fetch all questions for the submitted answers
    const questionIds = answers.map((a) => QuestionId.create(a.questionId));
    const questions = await Promise.all(
      questionIds.map((id) => this.questionRepository.findById(id)),
    );

    // Verify all questions exist
    const validQuestions = questions.filter((q) => q !== null);
    if (validQuestions.length !== answers.length) {
      throw new Error(
        "VALIDATION_ERROR: Some question IDs are invalid or not found",
      );
    }

    // 2. Grading loop - compare user answers with correct options
    let correctCount = 0;
    const totalCount = answers.length;

    for (const answer of answers) {
      const question = validQuestions.find(
        (q) => q.id.value === answer.questionId,
      );
      if (!question) continue;

      // Find the correct option for this question
      const correctOption = question.options.find((opt) => opt.isCorrect);
      if (correctOption && correctOption.id.value === answer.selectedOptionId) {
        correctCount++;
      }
    }

    // 3. Calculate score (percentage)
    const score = Math.round((correctCount / totalCount) * 100);

    // 4. Create QuizAttempt entity (encapsulates 70% passing rule)
    const attemptId = QuizAttemptId.create(randomUUID());
    const roadmapItemIdVO = RoadmapItemId.create(roadmapItemId);

    const quizAttempt = QuizAttempt.create(
      attemptId,
      ownerUserId,
      roadmapItemIdVO,
      score,
    );

    // 5. Persist the attempt
    await this.quizAttemptRepository.save(quizAttempt);

    // 6. Side Effect: If passed, update roadmap item status
    if (quizAttempt.passed) {
      const roadmap = await this.roadmapRepository.findById(roadmapIdVO);

      if (roadmap) {
        roadmap.updateItemStatus(roadmapItemIdVO, "completed");
        await this.roadmapRepository.save(roadmap);
      }
    }

    // 7. Generate feedback message
    const feedback = this.generateFeedback(
      score,
      quizAttempt.passed,
      correctCount,
      totalCount,
    );

    return {
      attemptId: attemptId.value,
      score,
      passed: quizAttempt.passed,
      correctCount,
      totalCount,
      feedback,
    };
  }

  private generateFeedback(
    score: number,
    passed: boolean,
    correct: number,
    total: number,
  ): string {
    if (passed) {
      if (score === 100) {
        return `Perfect score! You answered all ${total} questions correctly. Excellent work!`;
      }
      if (score >= 90) {
        return `Outstanding! You scored ${score}% (${correct}/${total}). Keep up the great work!`;
      }
      return `Well done! You passed with ${score}% (${correct}/${total}). Your roadmap item has been marked as completed.`;
    }

    // Failed
    if (score >= 50) {
      return `You scored ${score}% (${correct}/${total}). You need 70% to pass. You're close - review the material and try again!`;
    }
    return `You scored ${score}% (${correct}/${total}). You need 70% to pass. Take some time to study the topic before retrying.`;
  }
}
