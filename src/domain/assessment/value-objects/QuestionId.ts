import { DomainError } from "@domain/shared/errors/DomainError";

export class QuestionId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): QuestionId {
    if (!value || value.trim().length === 0) {
      throw new DomainError("QuestionId cannot be empty");
    }
    return new QuestionId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: QuestionId): boolean {
    return this._value === other._value;
  }
}
