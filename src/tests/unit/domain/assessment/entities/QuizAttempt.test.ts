import { describe, it, expect } from "vitest";
import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

describe("QuizAttempt", () => {
  const attemptId = QuizAttemptId.create("attempt-1");
  const userId = UserId.create("user-1");
  const roadmapItemId = RoadmapItemId.create("item-1");

  describe("create", () => {
    it("should create an attempt with valid score", () => {
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 85);

      expect(attempt.id.value).toBe("attempt-1");
      expect(attempt.userId.value).toBe("user-1");
      expect(attempt.roadmapItemId.value).toBe("item-1");
      expect(attempt.score).toBe(85);
    });

    it("should mark as passed when score >= 70", () => {
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 70);
      expect(attempt.passed).toBe(true);
    });

    it("should mark as passed when score is 100", () => {
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 100);
      expect(attempt.passed).toBe(true);
    });

    it("should mark as failed when score < 70", () => {
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 69);
      expect(attempt.passed).toBe(false);
    });

    it("should mark as failed when score is 0", () => {
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 0);
      expect(attempt.passed).toBe(false);
    });

    it("should set createdAt to now", () => {
      const before = new Date();
      const attempt = QuizAttempt.create(attemptId, userId, roadmapItemId, 50);
      const after = new Date();

      expect(attempt.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(attempt.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should reject score below 0", () => {
      expect(() =>
        QuizAttempt.create(attemptId, userId, roadmapItemId, -1),
      ).toThrow("QuizAttempt score must be between 0 and 100");
    });

    it("should reject score above 100", () => {
      expect(() =>
        QuizAttempt.create(attemptId, userId, roadmapItemId, 101),
      ).toThrow("QuizAttempt score must be between 0 and 100");
    });
  });

  describe("reconstitute", () => {
    it("should restore from persistence without recomputing passed", () => {
      const createdAt = new Date("2024-01-01");
      const attempt = QuizAttempt.reconstitute(
        attemptId,
        userId,
        roadmapItemId,
        50,
        true,
        createdAt,
      );

      expect(attempt.score).toBe(50);
      expect(attempt.passed).toBe(true);
      expect(attempt.createdAt).toBe(createdAt);
    });
  });
});
