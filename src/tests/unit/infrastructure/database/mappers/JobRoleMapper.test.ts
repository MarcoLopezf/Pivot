import { describe, it, expect } from "vitest";
import { JobRoleMapper } from "@infrastructure/database/mappers/JobRoleMapper";
import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

describe("JobRoleMapper", () => {
  const now = new Date("2024-01-01");
  const later = new Date("2024-06-01");

  describe("toDomain", () => {
    it("should convert Prisma model to domain entity", () => {
      const prismaRole = {
        id: "role-1",
        name: "Frontend Developer",
        category: "Engineering",
        isEnabled: true,
        popularity: 85,
        createdAt: now,
        updatedAt: later,
      };

      const domain = JobRoleMapper.toDomain(prismaRole);

      expect(domain.id.value).toBe("role-1");
      expect(domain.name).toBe("Frontend Developer");
      expect(domain.category).toBe("Engineering");
      expect(domain.isEnabled).toBe(true);
      expect(domain.popularity).toBe(85);
      expect(domain.createdAt).toEqual(now);
      expect(domain.updatedAt).toEqual(later);
    });

    it("should handle null category", () => {
      const prismaRole = {
        id: "role-2",
        name: "Data Scientist",
        category: null,
        isEnabled: false,
        popularity: 0,
        createdAt: now,
        updatedAt: later,
      };

      const domain = JobRoleMapper.toDomain(prismaRole);

      expect(domain.category).toBeNull();
      expect(domain.isEnabled).toBe(false);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain entity to Prisma format", () => {
      const role = JobRole.reconstitute(
        JobRoleId.create("role-1"),
        "Frontend Developer",
        "Engineering",
        true,
        85,
        now,
        later,
      );

      const persistence = JobRoleMapper.toPersistence(role);

      expect(persistence.id).toBe("role-1");
      expect(persistence.name).toBe("Frontend Developer");
      expect(persistence.category).toBe("Engineering");
      expect(persistence.isEnabled).toBe(true);
      expect(persistence.popularity).toBe(85);
      expect(persistence.createdAt).toEqual(now);
      expect(persistence.updatedAt).toEqual(later);
    });
  });
});
