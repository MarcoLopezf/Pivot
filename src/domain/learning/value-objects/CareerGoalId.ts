export class CareerGoalId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): CareerGoalId {
    if (!value || value.trim().length === 0) {
      throw new Error("CareerGoalId cannot be empty");
    }
    return new CareerGoalId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: CareerGoalId): boolean {
    return this._value === other._value;
  }
}
