import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export type RoadmapItemStatus = "pending" | "in_progress" | "completed";

export class RoadmapItem {
  private readonly _id: RoadmapItemId;
  private readonly _title: string;
  private readonly _description: string;
  private readonly _order: number;
  private _status: RoadmapItemStatus;

  private constructor(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    status: RoadmapItemStatus,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._order = order;
    this._status = status;
  }

  public static create(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
  ): RoadmapItem {
    if (title.trim().length === 0) {
      throw new Error("RoadmapItem title cannot be empty");
    }
    if (order < 1) {
      throw new Error("RoadmapItem order must be at least 1");
    }
    return new RoadmapItem(id, title, description, order, "pending");
  }

  public static reconstitute(
    id: RoadmapItemId,
    title: string,
    description: string,
    order: number,
    status: RoadmapItemStatus,
  ): RoadmapItem {
    return new RoadmapItem(id, title, description, order, status);
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
