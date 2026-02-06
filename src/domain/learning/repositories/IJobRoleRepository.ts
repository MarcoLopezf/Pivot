import { JobRole } from "@domain/learning/entities/JobRole";
import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

/**
 * IJobRoleRepository
 *
 * Repository interface (port) for JobRole aggregate.
 * Defines the contract for persisting and retrieving job roles.
 * Implementations live in the infrastructure layer.
 *
 * @layer Domain
 */
export interface IJobRoleRepository {
  /**
   * Find all job roles (including disabled)
   * @returns All roles sorted by popularity descending
   */
  findAll(): Promise<JobRole[]>;

  /**
   * Find only enabled job roles
   * @returns Enabled roles sorted by popularity descending
   */
  findEnabled(): Promise<JobRole[]>;

  /**
   * Find a job role by its ID
   * @param id - Job role identifier
   * @returns Role if found, null otherwise
   */
  findById(id: JobRoleId): Promise<JobRole | null>;

  /**
   * Persist a job role (create or update)
   * @param jobRole - Role entity to save
   */
  save(jobRole: JobRole): Promise<void>;
}
