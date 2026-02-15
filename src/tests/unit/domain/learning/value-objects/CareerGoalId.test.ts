import { describe, it, expect } from "vitest";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

describe("CareerGoalId Value Object", () => {
  describe("create", () => {
    it("should create a valid CareerGoalId", () => {
      const id = CareerGoalId.create("test-id-001");

      expect(id.value).toBe("test-id-001");
    });

    it("should throw error when id is empty string", () => {
      expect(() => CareerGoalId.create("")).toThrow(
        "CareerGoalId cannot be empty",
      );
    });

    it("should throw error when id is only whitespace", () => {
      expect(() => CareerGoalId.create("   ")).toThrow(
        "CareerGoalId cannot be empty",
      );
    });
  });

  describe("equals", () => {
    it("should return true for same id values", () => {
      const id1 = CareerGoalId.create("test-id-001");
      const id2 = CareerGoalId.create("test-id-001");

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different id values", () => {
      const id1 = CareerGoalId.create("test-id-001");
      const id2 = CareerGoalId.create("test-id-002");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("immutability", () => {
    it("should not allow modification of value", () => {
      const id = CareerGoalId.create("test-id-001");

      // @ts-expect-error - Testing immutability
      expect(() => (id.value = "new-value")).toThrow();
    });
  });
});
