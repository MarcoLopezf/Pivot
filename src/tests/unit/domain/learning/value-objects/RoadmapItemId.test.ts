import { describe, it, expect } from "vitest";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

describe("RoadmapItemId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = RoadmapItemId.create("item-123");
      expect(id.value).toBe("item-123");
    });

    it("should reject an empty string", () => {
      expect(() => RoadmapItemId.create("")).toThrow(
        "RoadmapItemId cannot be empty",
      );
    });

    it("should reject a whitespace-only string", () => {
      expect(() => RoadmapItemId.create("   ")).toThrow(
        "RoadmapItemId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another RoadmapItemId with the same value", () => {
      const a = RoadmapItemId.create("item-123");
      const b = RoadmapItemId.create("item-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a RoadmapItemId with a different value", () => {
      const a = RoadmapItemId.create("item-123");
      const b = RoadmapItemId.create("item-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
