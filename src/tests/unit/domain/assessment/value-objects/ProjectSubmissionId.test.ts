import { describe, it, expect } from "vitest";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";

describe("ProjectSubmissionId", () => {
  describe("create", () => {
    it("should accept a valid non-empty string", () => {
      const id = ProjectSubmissionId.create("sub-123");
      expect(id.value).toBe("sub-123");
    });

    it("should reject an empty string", () => {
      expect(() => ProjectSubmissionId.create("")).toThrow(
        "ProjectSubmissionId cannot be empty",
      );
    });

    it("should reject a whitespace-only string", () => {
      expect(() => ProjectSubmissionId.create("   ")).toThrow(
        "ProjectSubmissionId cannot be empty",
      );
    });
  });

  describe("equality", () => {
    it("should be equal to another ProjectSubmissionId with the same value", () => {
      const a = ProjectSubmissionId.create("sub-123");
      const b = ProjectSubmissionId.create("sub-123");
      expect(a.equals(b)).toBe(true);
    });

    it("should not be equal to a ProjectSubmissionId with a different value", () => {
      const a = ProjectSubmissionId.create("sub-123");
      const b = ProjectSubmissionId.create("sub-456");
      expect(a.equals(b)).toBe(false);
    });
  });
});
