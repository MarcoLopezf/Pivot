import { DomainError } from "@domain/shared/errors/DomainError";

/**
 * JobRoleId Value Object
 *
 * Type-safe identifier for JobRole entities.
 * Ensures IDs are never empty and provides equality comparison.
 *
 * @layer Domain
 */
export class JobRoleId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Factory method to create a JobRoleId
   * @param value - The ID string
   * @throws Error if value is empty or whitespace
   * @returns JobRoleId instance
   */
  public static create(value: string): JobRoleId {
    if (!value || value.trim().length === 0) {
      throw new DomainError("JobRoleId cannot be empty");
    }
    return new JobRoleId(value);
  }

  /**
   * Get the raw ID value
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Check equality with another JobRoleId
   * @param other - Another JobRoleId to compare
   * @returns true if IDs are equal
   */
  public equals(other: JobRoleId): boolean {
    return this._value === other._value;
  }
}
