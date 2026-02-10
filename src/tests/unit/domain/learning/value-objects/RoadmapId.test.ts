import { describe, it, expect } from "vitest";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";

describe("RoadmapId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = RoadmapId.create("roadmap-123");
      expect(id.value).toBe("roadmap-123");
    });

    it("should reject an empty string", () => {
      expect(() => RoadmapId.create("")).toThrow("RoadmapId cannot be empty");
    });

    it("should reject a whitespace-only string", () => {
      expect(() => RoadmapId.create("   ")).toThrow(
        "RoadmapId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another RoadmapId with the same value", () => {
      const a = RoadmapId.create("roadmap-123");
      const b = RoadmapId.create("roadmap-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a RoadmapId with a different value", () => {
      const a = RoadmapId.create("roadmap-123");
      const b = RoadmapId.create("roadmap-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
