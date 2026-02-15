import { describe, it, expect } from "vitest";
import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";

describe("QuizAttemptId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = QuizAttemptId.create("attempt-123");
      expect(id.value).toBe("attempt-123");
    });

    it("should reject an empty string", () => {
      expect(() => QuizAttemptId.create("")).toThrow(
        "QuizAttemptId cannot be empty",
      );
    });

    it("should reject a whitespace-only string", () => {
      expect(() => QuizAttemptId.create("   ")).toThrow(
        "QuizAttemptId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another QuizAttemptId with the same value", () => {
      const a = QuizAttemptId.create("attempt-123");
      const b = QuizAttemptId.create("attempt-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a QuizAttemptId with a different value", () => {
      const a = QuizAttemptId.create("attempt-123");
      const b = QuizAttemptId.create("attempt-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
