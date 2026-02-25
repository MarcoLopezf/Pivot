import { DomainError } from "@domain/shared/errors/DomainError";

export class ProjectSubmissionId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): ProjectSubmissionId {
    if (!value || value.trim().length === 0) {
      throw new DomainError("ProjectSubmissionId cannot be empty");
    }
    return new ProjectSubmissionId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ProjectSubmissionId): boolean {
    return this._value === other._value;
  }
}
