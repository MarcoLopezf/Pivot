export class RoadmapItemId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): RoadmapItemId {
    if (!value || value.trim().length === 0) {
      throw new Error("RoadmapItemId cannot be empty");
    }
    return new RoadmapItemId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: RoadmapItemId): boolean {
    return this._value === other._value;
  }
}
