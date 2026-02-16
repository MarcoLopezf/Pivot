import {
  type PrismaClient,
  type RoadmapItemStatus as PrismaRoadmapItemStatus,
  type RoadmapItemType as PrismaRoadmapItemType,
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

    await this.db.$transaction(
      async (tx) => {
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

        // Get existing item IDs to detect removals
        const existingItems = await tx.roadmapItem.findMany({
          where: { roadmapId: data.id },
          select: { id: true },
        });

        const currentItemIds = new Set(data.items.map((i) => i.id));
        const toDelete = existingItems
          .filter((e) => !currentItemIds.has(e.id))
          .map((e) => e.id);

        // Delete only removed items (cascade deletes their ProjectDetails)
        if (toDelete.length > 0) {
          await tx.roadmapItem.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        // Upsert each item to preserve related data (e.g. ProjectDetails)
        for (const item of data.items) {
          await tx.roadmapItem.upsert({
            where: { id: item.id },
            create: {
              id: item.id,
              roadmapId: data.id,
              title: item.title,
              description: item.description,
              order: item.order,
              status: item.status as PrismaRoadmapItemStatus,
              type: item.type as PrismaRoadmapItemType,
              tags: item.tags,
              difficulty: item.difficulty,
              submissionUrl: item.submissionUrl,
            },
            update: {
              title: item.title,
              description: item.description,
              order: item.order,
              status: item.status as PrismaRoadmapItemStatus,
              type: item.type as PrismaRoadmapItemType,
              tags: item.tags,
              difficulty: item.difficulty,
              submissionUrl: item.submissionUrl,
            },
          });
        }
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );
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

  async findAllByUserId(userId: UserId): Promise<Roadmap[]> {
    const prismaRoadmaps = await this.db.roadmap.findMany({
      where: {
        goal: {
          userId: userId.value,
        },
      },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });

    return prismaRoadmaps.map((r) => RoadmapMapper.toDomain(r));
  }

  /**
   * Find the owner user ID for a roadmap
   * Navigates: Roadmap -> CareerGoal -> User
   */
  async findOwnerUserId(roadmapId: RoadmapId): Promise<UserId | null> {
    const roadmap = await this.db.roadmap.findUnique({
      where: { id: roadmapId.value },
      include: { goal: { select: { userId: true } } },
    });

    if (!roadmap) return null;
    return UserId.create(roadmap.goal.userId);
  }
}
