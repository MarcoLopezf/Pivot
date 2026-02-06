import { type JobRole as PrismaJobRole } from "@prisma/client";
import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

/**
 * JobRoleMapper
 *
 * Maps between Prisma models and domain entities.
 * Keeps Prisma types isolated to the infrastructure layer.
 *
 * @layer Infrastructure
 */
export class JobRoleMapper {
  /**
   * Convert Prisma model to domain entity
   * @param prismaJobRole - Prisma JobRole model
   * @returns Domain JobRole entity
   */
  static toDomain(prismaJobRole: PrismaJobRole): JobRole {
    const id = JobRoleId.create(prismaJobRole.id);

    return JobRole.reconstitute(
      id,
      prismaJobRole.name,
      prismaJobRole.category,
      prismaJobRole.isEnabled,
      prismaJobRole.popularity,
      prismaJobRole.createdAt,
      prismaJobRole.updatedAt,
    );
  }

  /**
   * Convert domain entity to Prisma model format
   * @param domainJobRole - Domain JobRole entity
   * @returns Plain object for Prisma operations
   */
  static toPersistence(domainJobRole: JobRole): {
    id: string;
    name: string;
    category: string | null;
    isEnabled: boolean;
    popularity: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: domainJobRole.id.value,
      name: domainJobRole.name,
      category: domainJobRole.category,
      isEnabled: domainJobRole.isEnabled,
      popularity: domainJobRole.popularity,
      createdAt: domainJobRole.createdAt,
      updatedAt: domainJobRole.updatedAt,
    };
  }
}
