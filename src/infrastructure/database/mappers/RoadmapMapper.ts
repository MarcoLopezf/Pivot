import {
  type Roadmap as PrismaRoadmap,
  type RoadmapItem as PrismaRoadmapItem,
} from "@prisma/client";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import {
  RoadmapItem,
  RoadmapItemStatus,
} from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

type PrismaRoadmapWithItems = PrismaRoadmap & { items: PrismaRoadmapItem[] };

const STATUS_TO_DOMAIN: Record<string, RoadmapItemStatus> = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

const STATUS_TO_PRISMA: Record<RoadmapItemStatus, string> = {
  pending: "PENDING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
};

/**
 * RoadmapMapper
 *
 * Maps between Prisma models and domain entities for Roadmap aggregate.
 */
export class RoadmapMapper {
  static toDomain(prismaRoadmap: PrismaRoadmapWithItems): Roadmap {
    const items = prismaRoadmap.items
      .sort((a, b) => a.order - b.order)
      .map((item) =>
        RoadmapItem.reconstitute(
          RoadmapItemId.create(item.id),
          item.title,
          item.description,
          item.order,
          STATUS_TO_DOMAIN[item.status] ?? "pending",
        ),
      );

    return Roadmap.reconstitute(
      RoadmapId.create(prismaRoadmap.id),
      CareerGoalId.create(prismaRoadmap.goalId),
      prismaRoadmap.title,
      items,
      prismaRoadmap.createdAt,
      prismaRoadmap.updatedAt,
    );
  }

  static toPersistence(roadmap: Roadmap): {
    id: string;
    goalId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      title: string;
      description: string;
      order: number;
      status: string;
    }>;
  } {
    return {
      id: roadmap.id.value,
      goalId: roadmap.goalId.value,
      title: roadmap.title,
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
      items: roadmap.items.map((item) => ({
        id: item.id.value,
        title: item.title,
        description: item.description,
        order: item.order,
        status: STATUS_TO_PRISMA[item.status],
      })),
    };
  }
}
