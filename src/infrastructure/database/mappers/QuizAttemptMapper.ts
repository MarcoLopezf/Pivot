import { type QuizAttempt as PrismaQuizAttempt } from "@prisma/client";
import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export class QuizAttemptMapper {
  static toDomain(prismaAttempt: PrismaQuizAttempt): QuizAttempt {
    return QuizAttempt.reconstitute(
      QuizAttemptId.create(prismaAttempt.id),
      UserId.create(prismaAttempt.userId),
      RoadmapItemId.create(prismaAttempt.roadmapItemId),
      prismaAttempt.score,
      prismaAttempt.passed,
      prismaAttempt.createdAt,
    );
  }

  static toPersistence(attempt: QuizAttempt): {
    id: string;
    userId: string;
    roadmapItemId: string;
    score: number;
    passed: boolean;
    createdAt: Date;
  } {
    return {
      id: attempt.id.value,
      userId: attempt.userId.value,
      roadmapItemId: attempt.roadmapItemId.value,
      score: attempt.score,
      passed: attempt.passed,
      createdAt: attempt.createdAt,
    };
  }
}
