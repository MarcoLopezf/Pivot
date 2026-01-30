import { describe, it, expect } from "vitest";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

describe("QuestionOptionId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = QuestionOptionId.create("opt-123");
      expect(id.value).toBe("opt-123");
    });

    it("should reject an empty string", () => {
      expect(() => QuestionOptionId.create("")).toThrow(
        "QuestionOptionId cannot be empty",
      );
    });

    it("should reject a whitespace-only string", () => {
      expect(() => QuestionOptionId.create("   ")).toThrow(
        "QuestionOptionId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another QuestionOptionId with the same value", () => {
      const a = QuestionOptionId.create("opt-123");
      const b = QuestionOptionId.create("opt-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a QuestionOptionId with a different value", () => {
      const a = QuestionOptionId.create("opt-123");
      const b = QuestionOptionId.create("opt-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
