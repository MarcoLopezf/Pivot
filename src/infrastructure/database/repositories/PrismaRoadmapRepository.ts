import {
  type PrismaClient,
  type RoadmapItemStatus as PrismaRoadmapItemStatus,
} from "@prisma/client";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapMapper } from "@infrastructure/database/mappers/RoadmapMapper";

/**
 * PrismaRoadmapRepository
 *
 * Infrastructure adapter that implements IRoadmapRepository using Prisma.
 * Handles data persistence for Roadmap aggregates (including nested RoadmapItems).
 */
export class PrismaRoadmapRepository implements IRoadmapRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(roadmap: Roadmap): Promise<void> {
    const data = RoadmapMapper.toPersistence(roadmap);

    await this.db.$transaction(async (tx) => {
      await tx.roadmap.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          goalId: data.goalId,
          title: data.title,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
        update: {
          title: data.title,
          updatedAt: data.updatedAt,
        },
      });

      await tx.roadmapItem.deleteMany({
        where: { roadmapId: data.id },
      });

      if (data.items.length > 0) {
        await tx.roadmapItem.createMany({
          data: data.items.map((item) => ({
            id: item.id,
            roadmapId: data.id,
            title: item.title,
            description: item.description,
            order: item.order,
            status: item.status as PrismaRoadmapItemStatus,
          })),
        });
      }
    });
  }

  async findById(id: RoadmapId): Promise<Roadmap | null> {
    const prismaRoadmap = await this.db.roadmap.findUnique({
      where: { id: id.value },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!prismaRoadmap) return null;
    return RoadmapMapper.toDomain(prismaRoadmap);
  }

  async findByGoalId(goalId: CareerGoalId): Promise<Roadmap[]> {
    const prismaRoadmaps = await this.db.roadmap.findMany({
      where: { goalId: goalId.value },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return prismaRoadmaps.map((r) => RoadmapMapper.toDomain(r));
  }

  async findLatestByUserId(userId: UserId): Promise<Roadmap | null> {
    const prismaRoadmap = await this.db.roadmap.findFirst({
      where: {
        goal: {
          userId: userId.value,
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    if (!prismaRoadmap) return null;
    return RoadmapMapper.toDomain(prismaRoadmap);
  }
}
