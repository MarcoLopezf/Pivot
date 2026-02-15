import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetJobRoles } from "@application/use-cases/learning/GetJobRoles";
import { IJobRoleRepository } from "@domain/learning/repositories/IJobRoleRepository";
import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

describe("GetJobRoles Use Case", () => {
  let mockRepository: IJobRoleRepository;
  let useCase: GetJobRoles;

  beforeEach(() => {
    // Mock repository with vi.fn()
    mockRepository = {
      findAll: vi.fn(),
      findEnabled: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
    };

    useCase = new GetJobRoles(mockRepository);
  });

  describe("execute without query", () => {
    it("should return all enabled roles", async () => {
      const role1 = JobRole.create(
        JobRoleId.create("1"),
        "Software Engineer",
        "Engineering",
        90,
      );
      const role2 = JobRole.create(
        JobRoleId.create("2"),
        "Data Scientist",
        "Data",
        85,
      );

      vi.mocked(mockRepository.findEnabled).mockResolvedValue([role1, role2]);

      const result = await useCase.execute();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Software Engineer");
      expect(result[1].name).toBe("Data Scientist");
      expect(mockRepository.findEnabled).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no roles exist", async () => {
      vi.mocked(mockRepository.findEnabled).mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });

  describe("execute with query", () => {
    it("should filter roles by name (case-insensitive)", async () => {
      const role1 = JobRole.create(
        JobRoleId.create("1"),
        "Software Engineer",
        "Engineering",
        90,
      );
      const role2 = JobRole.create(
        JobRoleId.create("2"),
        "Data Scientist",
        "Data",
        85,
      );
      const role3 = JobRole.create(
        JobRoleId.create("3"),
        "DevOps Engineer",
        "DevOps",
        80,
      );

      vi.mocked(mockRepository.findEnabled).mockResolvedValue([
        role1,
        role2,
        role3,
      ]);

      const result = await useCase.execute("engineer");

      expect(result).toHaveLength(2);
      expect(result.some((r) => r.name === "Software Engineer")).toBe(true);
      expect(result.some((r) => r.name === "DevOps Engineer")).toBe(true);
      expect(result.some((r) => r.name === "Data Scientist")).toBe(false);
    });

    it("should return empty array when no roles match query", async () => {
      const role1 = JobRole.create(
        JobRoleId.create("1"),
        "Software Engineer",
        "Engineering",
        90,
      );

      vi.mocked(mockRepository.findEnabled).mockResolvedValue([role1]);

      const result = await useCase.execute("NonExistentRole");

      expect(result).toEqual([]);
    });

    it("should trim whitespace from query", async () => {
      const role1 = JobRole.create(
        JobRoleId.create("1"),
        "Software Engineer",
        "Engineering",
        90,
      );

      vi.mocked(mockRepository.findEnabled).mockResolvedValue([role1]);

      const result = await useCase.execute("  software  ");

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Software Engineer");
    });
  });
});
