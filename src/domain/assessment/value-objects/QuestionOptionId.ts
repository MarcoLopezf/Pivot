export class QuestionOptionId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): QuestionOptionId {
    if (!value || value.trim().length === 0) {
      throw new Error("QuestionOptionId cannot be empty");
    }
    return new QuestionOptionId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: QuestionOptionId): boolean {
    return this._value === other._value;
  }
}
