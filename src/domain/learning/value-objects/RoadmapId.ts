export class RoadmapId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): RoadmapId {
    if (!value || value.trim().length === 0) {
      throw new Error("RoadmapId cannot be empty");
    }
    return new RoadmapId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: RoadmapId): boolean {
    return this._value === other._value;
  }
}
