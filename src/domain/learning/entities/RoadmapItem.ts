import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export type RoadmapItemStatus = "pending" | "in_progress" | "completed";
export type RoadmapItemType = "theory" | "project";

export class RoadmapItem {
  private readonly _id: RoadmapItemId;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _order: number;
  private _status: RoadmapItemStatus;
  private readonly _type: RoadmapItemType;
  private readonly _topic: string;
  private readonly _difficulty: string;
  private readonly _submissionUrl: string | null;

  private constructor(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    status: RoadmapItemStatus,
    type: RoadmapItemType,
    topic: string,
    difficulty: string,
    submissionUrl: string | null,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._order = order;
    this._status = status;
    this._type = type;
    this._topic = topic;
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
      topic?: string;
      difficulty?: string;
      submissionUrl?: string | null;
    },
  ): RoadmapItem {
    if (title.trim().length === 0) {
      throw new Error("RoadmapItem title cannot be empty");
    }
    if (order < 1) {
      throw new Error("RoadmapItem order must be at least 1");
    }
    return new RoadmapItem(
      id,
      title,
      description,
      order,
      "pending",
      options?.type ?? "theory",
      options?.topic ?? "",
      options?.difficulty ?? "beginner",
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
    topic: string = "",
    difficulty: string = "beginner",
    submissionUrl: string | null = null,
  ): RoadmapItem {
    return new RoadmapItem(
      id,
      title,
      description,
      order,
      status,
      type,
      topic,
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

  public get topic(): string {
    return this._topic;
  }

  public get difficulty(): string {
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
