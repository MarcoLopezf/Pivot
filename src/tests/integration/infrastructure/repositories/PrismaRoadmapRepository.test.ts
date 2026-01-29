import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "PrismaRoadmapRepository (integration) — requires DATABASE_URL",
  () => {
    let repository: PrismaRoadmapRepository;
    const testUserId = "test-user-roadmap-001";
    const testGoalId = "test-goal-roadmap-001";

    beforeEach(async () => {
      repository = new PrismaRoadmapRepository(prisma);

      // Clean up only our own test records (by specific IDs) to avoid
      // race conditions with other integration test files running in parallel.
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goalId: testGoalId } },
      });
      await prisma.roadmap.deleteMany({ where: { goalId: testGoalId } });
      await prisma.careerGoal.deleteMany({ where: { id: testGoalId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });

      await prisma.user.upsert({
        where: { id: testUserId },
        create: {
          id: testUserId,
          email: "roadmap-test@example.com",
          name: "Roadmap Test User",
        },
        update: {},
      });
      await prisma.careerGoal.upsert({
        where: { id: testGoalId },
        create: {
          id: testGoalId,
          userId: testUserId,
          targetRole: "Senior Engineer",
          currentRole: "Junior Engineer",
        },
        update: {},
      });
    });

    it("should save a roadmap with nested items and retrieve it by ID", async () => {
      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-int-001"),
        CareerGoalId.create(testGoalId),
        "Path to Senior Engineer",
      );
      roadmap.addItem(
        RoadmapItem.create(
          RoadmapItemId.create("item-int-001"),
          "Learn TypeScript",
          "Study advanced TS patterns",
          1,
        ),
      );
      roadmap.addItem(
        RoadmapItem.create(
          RoadmapItemId.create("item-int-002"),
          "Learn System Design",
          "Study distributed systems",
          2,
        ),
      );

      await repository.save(roadmap);

      const found = await repository.findById(
        RoadmapId.create("roadmap-int-001"),
      );

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe("roadmap-int-001");
      expect(found!.title).toBe("Path to Senior Engineer");
      expect(found!.items).toHaveLength(2);
      expect(found!.items[0].title).toBe("Learn TypeScript");
      expect(found!.items[0].status).toBe("pending");
      expect(found!.items[1].title).toBe("Learn System Design");
      expect(found!.progress).toBe(0);
    });

    it("should return null when roadmap is not found by ID", async () => {
      const found = await repository.findById(RoadmapId.create("nonexistent"));

      expect(found).toBeNull();
    });

    it("should find roadmaps by goal ID", async () => {
      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-int-002"),
        CareerGoalId.create(testGoalId),
        "Another Path",
      );
      roadmap.addItem(
        RoadmapItem.create(
          RoadmapItemId.create("item-int-003"),
          "Learn Docker",
          "Containerization basics",
          1,
        ),
      );

      await repository.save(roadmap);

      const found = await repository.findByGoalId(
        CareerGoalId.create(testGoalId),
      );

      expect(found).toHaveLength(1);
      expect(found[0].title).toBe("Another Path");
      expect(found[0].items).toHaveLength(1);
    });

    it("should update existing roadmap items on re-save", async () => {
      const roadmapId = RoadmapId.create("roadmap-int-003");
      const goalId = CareerGoalId.create(testGoalId);

      const roadmap = Roadmap.create(roadmapId, goalId, "Update Test Path");
      roadmap.addItem(
        RoadmapItem.create(
          RoadmapItemId.create("item-int-004"),
          "Original Item",
          "desc",
          1,
        ),
      );
      await repository.save(roadmap);

      const retrieved = await repository.findById(roadmapId);
      expect(retrieved!.items).toHaveLength(1);

      const updatedRoadmap = Roadmap.create(
        roadmapId,
        goalId,
        "Update Test Path",
      );
      const item1 = RoadmapItem.create(
        RoadmapItemId.create("item-int-005"),
        "New Item 1",
        "desc",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("item-int-006"),
        "New Item 2",
        "desc",
        2,
      );
      item1.markCompleted();
      updatedRoadmap.addItem(item1);
      updatedRoadmap.addItem(item2);

      await repository.save(updatedRoadmap);

      const found = await repository.findById(roadmapId);
      expect(found!.items).toHaveLength(2);
      expect(found!.items[0].status).toBe("completed");
      expect(found!.progress).toBe(50);
    });
  },
);
