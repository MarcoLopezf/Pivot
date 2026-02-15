import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import {
  RoadmapItem,
  RoadmapItemStatus,
} from "@domain/learning/entities/RoadmapItem";

export class Roadmap {
  private readonly _id: RoadmapId;
  private readonly _goalId: CareerGoalId;
  private readonly _title: string;
  private readonly _items: RoadmapItem[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: RoadmapId,
    goalId: CareerGoalId,
    title: string,
    items: RoadmapItem[],
    createdAt: Date,
  ) {
    this._id = id;
    this._goalId = goalId;
    this._title = title;
    this._items = items;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
  }

  public static create(
    id: RoadmapId,
    goalId: CareerGoalId,
    title: string,
  ): Roadmap {
    if (title.trim().length === 0) {
      throw new Error("Roadmap title cannot be empty");
    }
    return new Roadmap(id, goalId, title, [], new Date());
  }

  public static reconstitute(
    id: RoadmapId,
    goalId: CareerGoalId,
    title: string,
    items: RoadmapItem[],
    createdAt: Date,
    updatedAt: Date,
  ): Roadmap {
    const roadmap = new Roadmap(id, goalId, title, items, createdAt);
    roadmap._updatedAt = updatedAt;
    return roadmap;
  }

  public get id(): RoadmapId {
    return this._id;
  }

  public get goalId(): CareerGoalId {
    return this._goalId;
  }

  public get title(): string {
    return this._title;
  }

  public get items(): RoadmapItem[] {
    return [...this._items];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get progress(): number {
    if (this._items.length === 0) {
      return 0;
    }
    const completed = this._items.filter(
      (item) => item.status === "completed",
    ).length;
    return Math.round((completed / this._items.length) * 100);
  }

  public addItem(item: RoadmapItem): void {
    this._items.push(item);
    this._updatedAt = new Date();
  }

  public updateItemStatus(
    itemId: RoadmapItemId,
    status: RoadmapItemStatus,
  ): void {
    const item = this._items.find((i) => i.id.equals(itemId));
    if (!item) {
      throw new Error("RoadmapItem not found");
    }
    switch (status) {
      case "completed":
        item.markCompleted();
        break;
      case "in_progress":
        item.markInProgress();
        break;
      case "pending":
        item.markPending();
        break;
    }
    this._updatedAt = new Date();
  }
}
