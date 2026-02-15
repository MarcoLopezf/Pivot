import { type PrismaClient } from "@prisma/client";
import { IQuizAttemptRepository } from "@domain/assessment/repositories/IQuizAttemptRepository";
import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { QuizAttemptMapper } from "@infrastructure/database/mappers/QuizAttemptMapper";

export class PrismaQuizAttemptRepository implements IQuizAttemptRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(attempt: QuizAttempt): Promise<void> {
    const data = QuizAttemptMapper.toPersistence(attempt);

    await this.db.quizAttempt.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        roadmapItemId: data.roadmapItemId,
        score: data.score,
        passed: data.passed,
        createdAt: data.createdAt,
      },
      update: {
        score: data.score,
        passed: data.passed,
      },
    });
  }

  async findByRoadmapItemId(
    roadmapItemId: RoadmapItemId,
  ): Promise<QuizAttempt[]> {
    const prismaAttempts = await this.db.quizAttempt.findMany({
      where: { roadmapItemId: roadmapItemId.value },
      orderBy: { createdAt: "desc" },
    });

    return prismaAttempts.map((a) => QuizAttemptMapper.toDomain(a));
  }

  async findByUserId(userId: UserId): Promise<QuizAttempt[]> {
    const prismaAttempts = await this.db.quizAttempt.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: "desc" },
    });

    return prismaAttempts.map((a) => QuizAttemptMapper.toDomain(a));
  }
}
