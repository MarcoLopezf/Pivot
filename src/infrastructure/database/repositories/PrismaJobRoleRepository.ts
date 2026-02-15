import {
  type PrismaClient,
  type JobRole as PrismaJobRole,
} from "@prisma/client";
import { IJobRoleRepository } from "@domain/learning/repositories/IJobRoleRepository";
import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";
import { JobRoleMapper } from "@infrastructure/database/mappers/JobRoleMapper";

/**
 * PrismaJobRoleRepository
 *
 * Infrastructure adapter that implements IJobRoleRepository using Prisma.
 * Handles data persistence for JobRole entities.
 *
 * @layer Infrastructure
 */
export class PrismaJobRoleRepository implements IJobRoleRepository {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Find all job roles (including disabled)
   * @returns All roles sorted by popularity descending
   */
  async findAll(): Promise<JobRole[]> {
    const prismaJobRoles = await this.db.jobRole.findMany({
      orderBy: { popularity: "desc" }, // Most popular first
    });

    return prismaJobRoles.map((jr: PrismaJobRole) =>
      JobRoleMapper.toDomain(jr),
    );
  }

  /**
   * Find only enabled job roles
   * @returns Enabled roles sorted by popularity descending
   */
  async findEnabled(): Promise<JobRole[]> {
    const prismaJobRoles = await this.db.jobRole.findMany({
      where: { isEnabled: true },
      orderBy: { popularity: "desc" },
    });

    return prismaJobRoles.map((jr: PrismaJobRole) =>
      JobRoleMapper.toDomain(jr),
    );
  }

  /**
   * Find a job role by its ID
   * @param id - Job role identifier
   * @returns Role if found, null otherwise
   */
  async findById(id: JobRoleId): Promise<JobRole | null> {
    const prismaJobRole = await this.db.jobRole.findUnique({
      where: { id: id.value },
    });

    if (!prismaJobRole) return null;

    return JobRoleMapper.toDomain(prismaJobRole);
  }

  /**
   * Persist a job role (create or update)
   * @param jobRole - Role entity to save
   */
  async save(jobRole: JobRole): Promise<void> {
    const data = JobRoleMapper.toPersistence(jobRole);

    await this.db.jobRole.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        category: data.category,
        isEnabled: data.isEnabled,
        popularity: data.popularity,
        updatedAt: data.updatedAt,
      },
    });
  }
}
