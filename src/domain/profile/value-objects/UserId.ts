export class UserId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): UserId {
    if (value.trim().length === 0) {
      throw new Error("UserId cannot be empty or whitespace");
    }
    return new UserId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: UserId): boolean {
    return this._value === other._value;
  }
}
