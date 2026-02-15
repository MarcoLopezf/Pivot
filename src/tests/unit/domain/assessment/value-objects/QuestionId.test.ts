import { describe, it, expect } from "vitest";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";

describe("QuestionId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = QuestionId.create("q-123");
      expect(id.value).toBe("q-123");
    });

    it("should accept a UUID-style string", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id = QuestionId.create(uuid);
      expect(id.value).toBe(uuid);
    });

    it("should reject an empty string", () => {
      expect(() => QuestionId.create("")).toThrow("QuestionId cannot be empty");
    });

    it("should reject a whitespace-only string", () => {
      expect(() => QuestionId.create("   ")).toThrow(
        "QuestionId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another QuestionId with the same value", () => {
      const a = QuestionId.create("q-123");
      const b = QuestionId.create("q-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a QuestionId with a different value", () => {
      const a = QuestionId.create("q-123");
      const b = QuestionId.create("q-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
