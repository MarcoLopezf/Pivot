import { IJobRoleRepository } from "@domain/learning/repositories/IJobRoleRepository";
import { JobRoleDTO } from "@application/dtos/learning/JobRoleDTO";

/**
 * GetJobRoles Use Case
 *
 * Retrieves job roles, optionally filtered by search query.
 * Returns only enabled roles, sorted by popularity (descending).
 *
 * @param query - Optional search term to filter roles by name
 * @returns List of job role DTOs
 *
 * @layer Application
 */
export class GetJobRoles {
  constructor(private readonly jobRoleRepository: IJobRoleRepository) {}

  /**
   * Execute the use case
   * @param query - Optional search term to filter roles by name (case-insensitive)
   * @returns Array of job role DTOs sorted by popularity
   */
  async execute(query?: string): Promise<JobRoleDTO[]> {
    // Fetch all enabled roles (repository handles sorting by popularity)
    const roles = await this.jobRoleRepository.findEnabled();

    // Filter by query if provided
    let filteredRoles = roles;
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim().toLowerCase();
      filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchTerm),
      );
    }

    // Map domain entities to DTOs
    return filteredRoles.map((role) => ({
      id: role.id.value,
      name: role.name,
      category: role.category,
      isEnabled: role.isEnabled,
      popularity: role.popularity,
    }));
  }
}
