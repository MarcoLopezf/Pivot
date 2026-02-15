/**
 * JobRoleDTO - Data Transfer Object for JobRole
 *
 * Used to transfer job role data between layers without exposing domain entities.
 *
 * @layer Application
 */
export interface JobRoleDTO {
  id: string;
  name: string;
  category: string | null;
  isEnabled: boolean;
  popularity: number;
}
