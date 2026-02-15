import {
  type PrismaClient,
  type CareerGoal as PrismaCareerGoal,
} from "@prisma/client";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { CareerGoalMapper } from "@infrastructure/database/mappers/CareerGoalMapper";

/**
 * PrismaCareerGoalRepository
 *
 * Infrastructure adapter that implements ICareerGoalRepository using Prisma.
 * Handles data persistence for CareerGoal entities.
 */
export class PrismaCareerGoalRepository implements ICareerGoalRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(careerGoal: CareerGoal): Promise<void> {
    const data = CareerGoalMapper.toPersistence(careerGoal);
    await this.db.careerGoal.upsert({
      where: { id: data.id },
      create: data,
      update: {
        targetRole: data.targetRole,
        currentRole: data.currentRole,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: CareerGoalId): Promise<CareerGoal | null> {
    const prismaCareerGoal = await this.db.careerGoal.findUnique({
      where: { id: id.value },
    });
    if (!prismaCareerGoal) return null;
    return CareerGoalMapper.toDomain(prismaCareerGoal);
  }

  async findByUserId(userId: UserId): Promise<CareerGoal[]> {
    const prismaCareerGoals = await this.db.careerGoal.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: "desc" },
    });
    return prismaCareerGoals.map((pg: PrismaCareerGoal) =>
      CareerGoalMapper.toDomain(pg),
    );
  }
}
