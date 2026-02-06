import { JobRoleId } from "@domain/learning/value-objects/JobRoleId";

/**
 * JobRole Entity
 *
 * Represents a curated job role in the system (e.g., "Software Engineer").
 * Used for career goal selection and roadmap generation.
 *
 * Business rules:
 * - Name cannot be empty
 * - Popularity tracks user interest (0-100 scale)
 * - isEnabled allows admins to hide obsolete roles
 *
 * @layer Domain
 */
export class JobRole {
  private readonly _id: JobRoleId;
  private readonly _name: string;
  private readonly _category: string | null;
  private _isEnabled: boolean;
  private _popularity: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: JobRoleId,
    name: string,
    category: string | null,
    isEnabled: boolean,
    popularity: number,
    createdAt: Date,
  ) {
    this._id = id;
    this._name = name;
    this._category = category;
    this._isEnabled = isEnabled;
    this._popularity = popularity;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
  }

  /**
   * Factory method to create a new JobRole
   * @param id - Unique identifier
   * @param name - Role name (e.g., "Software Engineer")
   * @param category - Optional category (e.g., "Engineering")
   * @param popularity - Popularity score (0-100)
   * @throws Error if name is empty or popularity is negative
   * @returns JobRole instance
   */
  public static create(
    id: JobRoleId,
    name: string,
    category: string | null,
    popularity: number,
  ): JobRole {
    if (name.trim().length === 0) {
      throw new Error("Job role name cannot be empty");
    }
    if (popularity < 0) {
      throw new Error("Popularity cannot be negative");
    }
    const now = new Date();
    return new JobRole(id, name, category, true, popularity, now);
  }

  /**
   * Reconstitute a JobRole from persistence
   * @param id - Unique identifier
   * @param name - Role name
   * @param category - Optional category
   * @param isEnabled - Whether role is active
   * @param popularity - Popularity score
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   * @returns JobRole instance
   */
  public static reconstitute(
    id: JobRoleId,
    name: string,
    category: string | null,
    isEnabled: boolean,
    popularity: number,
    createdAt: Date,
    updatedAt: Date,
  ): JobRole {
    const role = new JobRole(
      id,
      name,
      category,
      isEnabled,
      popularity,
      createdAt,
    );
    role._updatedAt = updatedAt;
    return role;
  }

  // Getters
  public get id(): JobRoleId {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get category(): string | null {
    return this._category;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public get popularity(): number {
    return this._popularity;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods

  /**
   * Increment popularity by 1
   * Used to track user selections
   */
  public incrementPopularity(): void {
    this._popularity += 1;
    this._updatedAt = new Date();
  }

  /**
   * Disable this role
   * Disabled roles are not shown to users
   */
  public disable(): void {
    this._isEnabled = false;
    this._updatedAt = new Date();
  }

  /**
   * Enable this role
   * Makes the role available for user selection
   */
  public enable(): void {
    this._isEnabled = true;
    this._updatedAt = new Date();
  }

  /**
   * Check if role is available for selection
   * @returns true if role is enabled
   */
  public isAvailable(): boolean {
    return this._isEnabled;
  }
}
