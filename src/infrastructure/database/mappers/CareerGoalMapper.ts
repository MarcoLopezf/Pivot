import { type CareerGoal as PrismaCareerGoal } from "@prisma/client";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * CareerGoalMapper
 *
 * Maps between Prisma models and domain entities.
 * Keeps Prisma types isolated to the infrastructure layer.
 */
export class CareerGoalMapper {
  /**
   * Convert Prisma model to domain entity
   */
  static toDomain(prismaCareerGoal: PrismaCareerGoal): CareerGoal {
    const id = CareerGoalId.create(prismaCareerGoal.id);
    const userId = UserId.create(prismaCareerGoal.userId);

    return CareerGoal.reconstitute(
      id,
      userId,
      prismaCareerGoal.targetRole,
      prismaCareerGoal.currentRole,
      prismaCareerGoal.createdAt,
      prismaCareerGoal.updatedAt,
    );
  }

  /**
   * Convert domain entity to Prisma model format
   */
  static toPersistence(domainCareerGoal: CareerGoal): {
    id: string;
    userId: string;
    targetRole: string;
    currentRole: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: domainCareerGoal.id.value,
      userId: domainCareerGoal.userId.value,
      targetRole: domainCareerGoal.targetRole,
      currentRole: domainCareerGoal.currentRole,
      createdAt: domainCareerGoal.createdAt,
      updatedAt: domainCareerGoal.updatedAt,
    };
  }
}
