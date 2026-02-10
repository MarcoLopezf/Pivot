import { describe, it, expect } from "vitest";
import { CareerGoalMapper } from "@infrastructure/database/mappers/CareerGoalMapper";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";

describe("CareerGoalMapper", () => {
  const now = new Date("2024-01-01");
  const later = new Date("2024-06-01");

  describe("toDomain", () => {
    it("should convert Prisma model to domain entity", () => {
      const prismaGoal = {
        id: "goal-1",
        userId: "user-1",
        targetRole: "Senior Engineer",
        currentRole: "Junior Developer",
        createdAt: now,
        updatedAt: later,
      };

      const domain = CareerGoalMapper.toDomain(prismaGoal);

      expect(domain.id.value).toBe("goal-1");
      expect(domain.userId.value).toBe("user-1");
      expect(domain.targetRole).toBe("Senior Engineer");
      expect(domain.currentRole).toBe("Junior Developer");
      expect(domain.createdAt).toEqual(now);
      expect(domain.updatedAt).toEqual(later);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain entity to Prisma format", () => {
      const goal = CareerGoal.reconstitute(
        CareerGoalId.create("goal-1"),
        UserId.create("user-1"),
        "Senior Engineer",
        "Junior Developer",
        now,
        later,
      );

      const persistence = CareerGoalMapper.toPersistence(goal);

      expect(persistence.id).toBe("goal-1");
      expect(persistence.userId).toBe("user-1");
      expect(persistence.targetRole).toBe("Senior Engineer");
      expect(persistence.currentRole).toBe("Junior Developer");
      expect(persistence.createdAt).toEqual(now);
      expect(persistence.updatedAt).toEqual(later);
    });
  });
});
