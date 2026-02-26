import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";
import { DomainError } from "@domain/shared/errors/DomainError";

export type RoadmapItemStatus = "pending" | "in_progress" | "completed";
export type RoadmapItemType = "theory" | "project";

export class RoadmapItem {
  private readonly _id: RoadmapItemId;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _order: number;
  private _status: RoadmapItemStatus;
  private readonly _type: RoadmapItemType;
  private readonly _tags: string[];
  private readonly _difficulty: DifficultyLevel;
  private readonly _submissionUrl: string | null;

  private constructor(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    status: RoadmapItemStatus,
    type: RoadmapItemType,
    tags: string[],
    difficulty: DifficultyLevel,
    submissionUrl: string | null,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._order = order;
    this._status = status;
    this._type = type;
    this._tags = tags;
    this._difficulty = difficulty;
    this._submissionUrl = submissionUrl;
  }

  public static create(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    options?: {
      type?: RoadmapItemType;
      tags?: string[];
      difficulty?: DifficultyLevel;
      submissionUrl?: string | null;
    },
  ): RoadmapItem {
    if (title.trim().length === 0) {
      throw new DomainError("RoadmapItem title cannot be empty");
    }
    if (order < 1) {
      throw new DomainError("RoadmapItem order must be at least 1");
    }
    return new RoadmapItem(
      id,
      title,
      description,
      order,
      "pending",
      options?.type ?? "theory",
      options?.tags ?? [],
      options?.difficulty ?? DifficultyLevel.Beginner,
      options?.submissionUrl ?? null,
    );
  }

  public static reconstitute(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    status: RoadmapItemStatus,
    type: RoadmapItemType = "theory",
    tags: string[] = [],
    difficulty: DifficultyLevel = DifficultyLevel.Beginner,
    submissionUrl: string | null = null,
  ): RoadmapItem {
    return new RoadmapItem(
      id,
      title,
      description,
      order,
      status,
      type,
      tags,
      difficulty,
      submissionUrl,
    );
  }

  public get id(): RoadmapItemId {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get order(): number {
    return this._order;
  }

  public get status(): RoadmapItemStatus {
    return this._status;
  }

  public get type(): RoadmapItemType {
    return this._type;
  }

  public get tags(): string[] {
    return this._tags;
  }

  public get difficulty(): DifficultyLevel {
    return this._difficulty;
  }

  public get submissionUrl(): string | null {
    return this._submissionUrl;
  }

  public markCompleted(): void {
    this._status = "completed";
  }

  public markInProgress(): void {
    this._status = "in_progress";
  }

  public markPending(): void {
    this._status = "pending";
  }
}
