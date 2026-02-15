import { describe, it, expect } from "vitest";
import { RoadmapMapper } from "@infrastructure/database/mappers/RoadmapMapper";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import type {
  RoadmapItemStatus as PrismaRoadmapItemStatus,
  RoadmapItemType as PrismaRoadmapItemType,
} from "@prisma/client";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

describe("RoadmapMapper", () => {
  const now = new Date("2024-01-01");
  const later = new Date("2024-06-01");

  describe("toDomain", () => {
    it("should convert Prisma roadmap with items to domain entity", () => {
      const prismaRoadmap = {
        id: "roadmap-1",
        goalId: "goal-1",
        title: "Learn TypeScript",
        createdAt: now,
        updatedAt: later,
        items: [
          {
            id: "item-2",
            roadmapId: "roadmap-1",
            title: "Advanced Types",
            description: "Learn advanced TS types",
            order: 2,
            status: "COMPLETED" as PrismaRoadmapItemStatus,
            type: "THEORY" as PrismaRoadmapItemType,
            tags: ["typescript"],
            difficulty: "intermediate",
            submissionUrl: null,
            createdAt: now,
            updatedAt: later,
          },
          {
            id: "item-1",
            roadmapId: "roadmap-1",
            title: "Basics",
            description: "Learn TS basics",
            order: 1,
            status: "PENDING" as PrismaRoadmapItemStatus,
            type: "PROJECT" as PrismaRoadmapItemType,
            tags: ["typescript"],
            difficulty: "beginner",
            submissionUrl: "https://github.com/user/repo",
            createdAt: now,
            updatedAt: later,
          },
        ],
      };

      const domain = RoadmapMapper.toDomain(prismaRoadmap);

      expect(domain.id.value).toBe("roadmap-1");
      expect(domain.goalId.value).toBe("goal-1");
      expect(domain.title).toBe("Learn TypeScript");
      expect(domain.items).toHaveLength(2);
      // Items should be sorted by order
      expect(domain.items[0].order).toBe(1);
      expect(domain.items[0].title).toBe("Basics");
      expect(domain.items[0].status).toBe("pending");
      expect(domain.items[0].type).toBe("project");
      expect(domain.items[0].submissionUrl).toBe(
        "https://github.com/user/repo",
      );
      expect(domain.items[1].order).toBe(2);
      expect(domain.items[1].status).toBe("completed");
      expect(domain.items[1].type).toBe("theory");
    });

    it("should handle unknown status by defaulting to pending", () => {
      const prismaRoadmap = {
        id: "roadmap-2",
        goalId: "goal-1",
        title: "Test",
        createdAt: now,
        updatedAt: later,
        items: [
          {
            id: "item-1",
            roadmapId: "roadmap-2",
            title: "Item",
            description: "desc",
            order: 1,
            status: "UNKNOWN" as PrismaRoadmapItemStatus,
            type: "UNKNOWN" as PrismaRoadmapItemType,
            tags: [],
            difficulty: "beginner",
            submissionUrl: null,
            createdAt: now,
            updatedAt: later,
          },
        ],
      };

      const domain = RoadmapMapper.toDomain(prismaRoadmap);

      expect(domain.items[0].status).toBe("pending");
      expect(domain.items[0].type).toBe("theory");
    });

    it("should handle IN_PROGRESS status", () => {
      const prismaRoadmap = {
        id: "roadmap-3",
        goalId: "goal-1",
        title: "Test",
        createdAt: now,
        updatedAt: later,
        items: [
          {
            id: "item-1",
            roadmapId: "roadmap-3",
            title: "Item",
            description: "desc",
            order: 1,
            status: "IN_PROGRESS" as PrismaRoadmapItemStatus,
            type: "THEORY" as PrismaRoadmapItemType,
            tags: [],
            difficulty: "beginner",
            submissionUrl: null,
            createdAt: now,
            updatedAt: later,
          },
        ],
      };

      const domain = RoadmapMapper.toDomain(prismaRoadmap);
      expect(domain.items[0].status).toBe("in_progress");
    });

    it("should handle empty items array", () => {
      const prismaRoadmap = {
        id: "roadmap-4",
        goalId: "goal-1",
        title: "Empty Roadmap",
        createdAt: now,
        updatedAt: later,
        items: [],
      };

      const domain = RoadmapMapper.toDomain(prismaRoadmap);
      expect(domain.items).toHaveLength(0);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain entity to Prisma format", () => {
      const roadmap = Roadmap.reconstitute(
        RoadmapId.create("roadmap-1"),
        CareerGoalId.create("goal-1"),
        "Learn TypeScript",
        [
          RoadmapItem.reconstitute(
            RoadmapItemId.create("item-1"),
            "Basics",
            "Learn basics",
            1,
            "pending",
            "theory",
            ["typescript"],
            DifficultyLevel.Beginner,
            null,
          ),
          RoadmapItem.reconstitute(
            RoadmapItemId.create("item-2"),
            "Project",
            "Build project",
            2,
            "completed",
            "project",
            ["typescript"],
            DifficultyLevel.Intermediate,
            "https://github.com/repo",
          ),
        ],
        now,
        later,
      );

      const persistence = RoadmapMapper.toPersistence(roadmap);

      expect(persistence.id).toBe("roadmap-1");
      expect(persistence.goalId).toBe("goal-1");
      expect(persistence.title).toBe("Learn TypeScript");
      expect(persistence.items).toHaveLength(2);
      expect(persistence.items[0].status).toBe("PENDING");
      expect(persistence.items[0].type).toBe("THEORY");
      expect(persistence.items[1].status).toBe("COMPLETED");
      expect(persistence.items[1].type).toBe("PROJECT");
      expect(persistence.items[1].submissionUrl).toBe(
        "https://github.com/repo",
      );
    });

    it("should map in_progress status correctly", () => {
      const roadmap = Roadmap.reconstitute(
        RoadmapId.create("roadmap-2"),
        CareerGoalId.create("goal-1"),
        "Test",
        [
          RoadmapItem.reconstitute(
            RoadmapItemId.create("item-1"),
            "Item",
            "desc",
            1,
            "in_progress",
          ),
        ],
        now,
        later,
      );

      const persistence = RoadmapMapper.toPersistence(roadmap);
      expect(persistence.items[0].status).toBe("IN_PROGRESS");
    });
  });
});
