import { describe, it, expect, beforeEach } from "vitest";
import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

describe("JobRole Entity", () => {
  let roleId: JobRoleId;

  beforeEach(() => {
    roleId = JobRoleId.create("role-001");
  });

  describe("create", () => {
    it("should create a valid JobRole", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      expect(role.id.value).toBe("role-001");
      expect(role.name).toBe("Software Engineer");
      expect(role.category).toBe("Engineering");
      expect(role.popularity).toBe(85);
      expect(role.isEnabled).toBe(true);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when name is empty", () => {
      expect(() => JobRole.create(roleId, "", "Engineering", 85)).toThrow(
        "Job role name cannot be empty",
      );
    });

    it("should throw error when name is only whitespace", () => {
      expect(() => JobRole.create(roleId, "   ", "Engineering", 85)).toThrow(
        "Job role name cannot be empty",
      );
    });

    it("should throw error when popularity is negative", () => {
      expect(() =>
        JobRole.create(roleId, "Software Engineer", "Engineering", -1),
      ).toThrow("Popularity cannot be negative");
    });

    it("should throw error when popularity exceeds 100", () => {
      expect(() =>
        JobRole.create(roleId, "Software Engineer", "Engineering", 101),
      ).toThrow("Popularity cannot exceed 100");
    });

    it("should create role with null category", () => {
      const role = JobRole.create(roleId, "Software Engineer", null, 85);

      expect(role.category).toBeNull();
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a JobRole with all fields", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");

      const role = JobRole.reconstitute(
        roleId,
        "Software Engineer",
        "Engineering",
        true,
        85,
        createdAt,
        updatedAt,
      );

      expect(role.isEnabled).toBe(true);
      expect(role.createdAt).toEqual(createdAt);
      expect(role.updatedAt).toEqual(updatedAt);
    });
  });

  describe("incrementPopularity", () => {
    it("should increment popularity by 1", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      role.incrementPopularity();

      expect(role.popularity).toBe(86);
    });

    it("should update updatedAt when incrementing popularity", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      const before = Date.now();
      role.incrementPopularity();
      const after = Date.now();

      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(role.updatedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it("should cap popularity at 100 when incrementing from 99", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        99,
      );

      role.incrementPopularity();

      expect(role.popularity).toBe(100);
    });

    it("should not increment popularity beyond 100", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        100,
      );

      role.incrementPopularity();

      expect(role.popularity).toBe(100);
    });

    it("should still update updatedAt even when at max popularity", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        100,
      );

      const before = Date.now();
      role.incrementPopularity();
      const after = Date.now();

      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(role.updatedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("disable", () => {
    it("should disable the role", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      role.disable();

      expect(role.isEnabled).toBe(false);
    });

    it("should update updatedAt when disabling", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      const before = Date.now();
      role.disable();
      const after = Date.now();

      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(role.updatedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("enable", () => {
    it("should enable the role", () => {
      const role = JobRole.reconstitute(
        roleId,
        "Software Engineer",
        "Engineering",
        false, // disabled
        85,
        new Date(),
        new Date(),
      );

      role.enable();

      expect(role.isEnabled).toBe(true);
    });

    it("should update updatedAt when enabling", () => {
      const role = JobRole.reconstitute(
        roleId,
        "Software Engineer",
        "Engineering",
        false,
        85,
        new Date(),
        new Date(),
      );

      const before = Date.now();
      role.enable();
      const after = Date.now();

      expect(role.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(role.updatedAt.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("isAvailable", () => {
    it("should return true when role is enabled", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );

      expect(role.isAvailable()).toBe(true);
    });

    it("should return false when role is disabled", () => {
      const role = JobRole.create(
        roleId,
        "Software Engineer",
        "Engineering",
        85,
      );
      role.disable();

      expect(role.isAvailable()).toBe(false);
    });
  });
});
