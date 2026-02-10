import { describe, it, expect } from "vitest";
import { QuizAttemptMapper } from "@infrastructure/database/mappers/QuizAttemptMapper";
import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

describe("QuizAttemptMapper", () => {
  const now = new Date("2024-01-01");

  describe("toDomain", () => {
    it("should convert Prisma model to domain entity (passed)", () => {
      const prismaAttempt = {
        id: "attempt-1",
        userId: "user-1",
        roadmapItemId: "item-1",
        score: 85,
        passed: true,
        createdAt: now,
      };

      const domain = QuizAttemptMapper.toDomain(prismaAttempt);

      expect(domain.id.value).toBe("attempt-1");
      expect(domain.userId.value).toBe("user-1");
      expect(domain.roadmapItemId.value).toBe("item-1");
      expect(domain.score).toBe(85);
      expect(domain.passed).toBe(true);
      expect(domain.createdAt).toEqual(now);
    });

    it("should convert Prisma model to domain entity (failed)", () => {
      const prismaAttempt = {
        id: "attempt-2",
        userId: "user-1",
        roadmapItemId: "item-1",
        score: 40,
        passed: false,
        createdAt: now,
      };

      const domain = QuizAttemptMapper.toDomain(prismaAttempt);

      expect(domain.score).toBe(40);
      expect(domain.passed).toBe(false);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain entity to Prisma format", () => {
      const attempt = QuizAttempt.reconstitute(
        QuizAttemptId.create("attempt-1"),
        UserId.create("user-1"),
        RoadmapItemId.create("item-1"),
        90,
        true,
        now,
      );

      const persistence = QuizAttemptMapper.toPersistence(attempt);

      expect(persistence.id).toBe("attempt-1");
      expect(persistence.userId).toBe("user-1");
      expect(persistence.roadmapItemId).toBe("item-1");
      expect(persistence.score).toBe(90);
      expect(persistence.passed).toBe(true);
      expect(persistence.createdAt).toEqual(now);
    });
  });
});
