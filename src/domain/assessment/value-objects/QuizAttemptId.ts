export class QuizAttemptId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): QuizAttemptId {
    if (!value || value.trim().length === 0) {
      throw new Error("QuizAttemptId cannot be empty");
    }
    return new QuizAttemptId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: QuizAttemptId): boolean {
    return this._value === other._value;
  }
}
