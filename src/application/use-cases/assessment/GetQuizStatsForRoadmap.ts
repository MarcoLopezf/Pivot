import {
  IQuizAttemptRepository,
  QuizStats,
} from "@domain/assessment/repositories/IQuizAttemptRepository";

export interface GetQuizStatsForRoadmapInput {
  userId: string;
  roadmapId: string;
}

export type GetQuizStatsForRoadmapResult =
  | { success: true; data: QuizStats }
  | { success: false; error: string };

/**
 * GetQuizStatsForRoadmap Use Case
 *
 * Returns aggregated quiz statistics (avg score) for a given user + roadmap.
 */
export class GetQuizStatsForRoadmap {
  constructor(private readonly quizAttemptRepository: IQuizAttemptRepository) {}

  async execute(
    input: GetQuizStatsForRoadmapInput,
  ): Promise<GetQuizStatsForRoadmapResult> {
    try {
      const stats = await this.quizAttemptRepository.getStatsForRoadmap(
        input.userId,
        input.roadmapId,
      );
      return { success: true, data: stats };
    } catch {
      return { success: false, error: "Failed to load quiz stats" };
    }
  }
}
