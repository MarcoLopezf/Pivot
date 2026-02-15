import { describe, it, expect, beforeEach } from "vitest";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";

describe("CareerGoal Entity", () => {
  let goalId: CareerGoalId;
  let userId: UserId;

  beforeEach(() => {
    goalId = CareerGoalId.create("goal-001");
    userId = UserId.create("user-001");
  });

  describe("create", () => {
    it("should create a valid CareerGoal", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      expect(goal.id.value).toBe("goal-001");
      expect(goal.userId.value).toBe("user-001");
      expect(goal.targetRole).toBe("Senior Backend Engineer");
      expect(goal.currentRole).toBe("Junior Backend Engineer");
      expect(goal.createdAt).toBeInstanceOf(Date);
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when target role is empty", () => {
      expect(() =>
        CareerGoal.create(goalId, userId, "", "Junior Backend Engineer"),
      ).toThrow("Target role cannot be empty");
    });

    it("should throw error when target role is only whitespace", () => {
      expect(() =>
        CareerGoal.create(goalId, userId, "   ", "Junior Backend Engineer"),
      ).toThrow("Target role cannot be empty");
    });

    it("should throw error when current role is empty", () => {
      expect(() =>
        CareerGoal.create(goalId, userId, "Senior Backend Engineer", ""),
      ).toThrow("Current role cannot be empty");
    });

    it("should throw error when current role is only whitespace", () => {
      expect(() =>
        CareerGoal.create(goalId, userId, "Senior Backend Engineer", "   "),
      ).toThrow("Current role cannot be empty");
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a CareerGoal with preserved timestamps", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");

      const goal = CareerGoal.reconstitute(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
        createdAt,
        updatedAt,
      );

      expect(goal.createdAt).toEqual(createdAt);
      expect(goal.updatedAt).toEqual(updatedAt);
    });
  });

  describe("updateTargetRole", () => {
    it("should update target role successfully", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      goal.updateTargetRole("Tech Lead");

      expect(goal.targetRole).toBe("Tech Lead");
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when updating to empty target role", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      expect(() => goal.updateTargetRole("")).toThrow(
        "Target role cannot be empty",
      );
    });
  });

  describe("updateCurrentRole", () => {
    it("should update current role successfully", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      goal.updateCurrentRole("Mid-level Backend Engineer");

      expect(goal.currentRole).toBe("Mid-level Backend Engineer");
      expect(goal.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when updating to empty current role", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      expect(() => goal.updateCurrentRole("")).toThrow(
        "Current role cannot be empty",
      );
    });
  });

  describe("immutability", () => {
    it("should not allow direct modification of id", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      // @ts-expect-error - Testing immutability
      expect(() => (goal.id = CareerGoalId.create("new-id"))).toThrow();
    });

    it("should not allow direct modification of userId", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      // @ts-expect-error - Testing immutability
      expect(() => (goal.userId = UserId.create("new-user"))).toThrow();
    });

    it("should not allow direct modification of createdAt", () => {
      const goal = CareerGoal.create(
        goalId,
        userId,
        "Senior Backend Engineer",
        "Junior Backend Engineer",
      );

      // @ts-expect-error - Testing immutability
      expect(() => (goal.createdAt = new Date())).toThrow();
    });
  });
});
