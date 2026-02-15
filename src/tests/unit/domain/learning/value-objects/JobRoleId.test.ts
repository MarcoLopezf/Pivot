import { describe, it, expect } from "vitest";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

describe("JobRoleId Value Object", () => {
  describe("create", () => {
    it("should create a valid JobRoleId", () => {
      const id = JobRoleId.create("role-001");

      expect(id.value).toBe("role-001");
    });

    it("should throw error when value is empty", () => {
      expect(() => JobRoleId.create("")).toThrow("JobRoleId cannot be empty");
    });

    it("should throw error when value is only whitespace", () => {
      expect(() => JobRoleId.create("   ")).toThrow(
        "JobRoleId cannot be empty",
      );
    });
  });

  describe("equals", () => {
    it("should return true for equal IDs", () => {
      const id1 = JobRoleId.create("role-001");
      const id2 = JobRoleId.create("role-001");

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different IDs", () => {
      const id1 = JobRoleId.create("role-001");
      const id2 = JobRoleId.create("role-002");

      expect(id1.equals(id2)).toBe(false);
    });
  });
});
