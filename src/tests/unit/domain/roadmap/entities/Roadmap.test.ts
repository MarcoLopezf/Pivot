import { describe, it, expect, beforeEach } from "vitest";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

describe("RoadmapItem Entity", () => {
  let itemId: RoadmapItemId;

  beforeEach(() => {
    itemId = RoadmapItemId.create("item-001");
  });

  describe("create", () => {
    it("should create a valid RoadmapItem with pending status", () => {
      const item = RoadmapItem.create(
        itemId,
        "Learn TypeScript Generics",
        "Study advanced generics patterns",
        1,
      );

      expect(item.id.value).toBe("item-001");
      expect(item.title).toBe("Learn TypeScript Generics");
      expect(item.description).toBe("Study advanced generics patterns");
      expect(item.order).toBe(1);
      expect(item.status).toBe("pending");
    });

    it("should throw error when title is empty", () => {
      expect(() => RoadmapItem.create(itemId, "", "desc", 1)).toThrow(
        "RoadmapItem title cannot be empty",
      );
    });

    it("should throw error when title is only whitespace", () => {
      expect(() => RoadmapItem.create(itemId, "   ", "desc", 1)).toThrow(
        "RoadmapItem title cannot be empty",
      );
    });

    it("should throw error when order is less than 1", () => {
      expect(() => RoadmapItem.create(itemId, "Title", "desc", 0)).toThrow(
        "RoadmapItem order must be at least 1",
      );
    });

    it("should throw error when order is negative", () => {
      expect(() => RoadmapItem.create(itemId, "Title", "desc", -1)).toThrow(
        "RoadmapItem order must be at least 1",
      );
    });
  });

  describe("markCompleted", () => {
    it("should mark item as completed", () => {
      const item = RoadmapItem.create(itemId, "Learn TS", "desc", 1);

      item.markCompleted();

      expect(item.status).toBe("completed");
    });
  });

  describe("markInProgress", () => {
    it("should mark item as in_progress", () => {
      const item = RoadmapItem.create(itemId, "Learn TS", "desc", 1);

      item.markInProgress();

      expect(item.status).toBe("in_progress");
    });
  });

  describe("markPending", () => {
    it("should reset item to pending", () => {
      const item = RoadmapItem.create(itemId, "Learn TS", "desc", 1);
      item.markCompleted();

      item.markPending();

      expect(item.status).toBe("pending");
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a RoadmapItem with given status", () => {
      const item = RoadmapItem.reconstitute(
        itemId,
        "Learn TS",
        "desc",
        2,
        "completed",
      );

      expect(item.id.value).toBe("item-001");
      expect(item.title).toBe("Learn TS");
      expect(item.order).toBe(2);
      expect(item.status).toBe("completed");
    });
  });
});

describe("Roadmap Entity", () => {
  let roadmapId: RoadmapId;
  let goalId: CareerGoalId;

  beforeEach(() => {
    roadmapId = RoadmapId.create("roadmap-001");
    goalId = CareerGoalId.create("goal-001");
  });

  describe("create", () => {
    it("should create a roadmap with 0 progress and empty items", () => {
      const roadmap = Roadmap.create(
        roadmapId,
        goalId,
        "Path to Senior Engineer",
      );

      expect(roadmap.id.value).toBe("roadmap-001");
      expect(roadmap.goalId.value).toBe("goal-001");
      expect(roadmap.title).toBe("Path to Senior Engineer");
      expect(roadmap.items).toHaveLength(0);
      expect(roadmap.progress).toBe(0);
      expect(roadmap.createdAt).toBeInstanceOf(Date);
      expect(roadmap.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when title is empty", () => {
      expect(() => Roadmap.create(roadmapId, goalId, "")).toThrow(
        "Roadmap title cannot be empty",
      );
    });

    it("should throw error when title is only whitespace", () => {
      expect(() => Roadmap.create(roadmapId, goalId, "   ")).toThrow(
        "Roadmap title cannot be empty",
      );
    });
  });

  describe("addItem", () => {
    it("should add an item to the roadmap", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const item = RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "Learn TypeScript",
        "Study TS fundamentals",
        1,
      );

      roadmap.addItem(item);

      expect(roadmap.items).toHaveLength(1);
      expect(roadmap.items[0].title).toBe("Learn TypeScript");
    });

    it("should update updatedAt when adding an item", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const initialUpdatedAt = roadmap.updatedAt;

      const item = RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "Learn TypeScript",
        "Study TS fundamentals",
        1,
      );

      roadmap.addItem(item);

      expect(roadmap.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );
    });
  });

  describe("progress calculation", () => {
    it("should return 0 when no items exist", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");

      expect(roadmap.progress).toBe(0);
    });

    it("should return 0 when no items are completed", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      roadmap.addItem(
        RoadmapItem.create(RoadmapItemId.create("i1"), "Item 1", "desc", 1),
      );
      roadmap.addItem(
        RoadmapItem.create(RoadmapItemId.create("i2"), "Item 2", "desc", 2),
      );

      expect(roadmap.progress).toBe(0);
    });

    it("should calculate 50% when 1 of 2 items is completed", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const item1 = RoadmapItem.create(
        RoadmapItemId.create("i1"),
        "Item 1",
        "desc",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("i2"),
        "Item 2",
        "desc",
        2,
      );
      roadmap.addItem(item1);
      roadmap.addItem(item2);

      item1.markCompleted();

      expect(roadmap.progress).toBe(50);
    });

    it("should calculate 100% when all items are completed", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const item1 = RoadmapItem.create(
        RoadmapItemId.create("i1"),
        "Item 1",
        "desc",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("i2"),
        "Item 2",
        "desc",
        2,
      );
      roadmap.addItem(item1);
      roadmap.addItem(item2);

      item1.markCompleted();
      item2.markCompleted();

      expect(roadmap.progress).toBe(100);
    });

    it("should round progress to nearest integer", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const item1 = RoadmapItem.create(
        RoadmapItemId.create("i1"),
        "Item 1",
        "desc",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("i2"),
        "Item 2",
        "desc",
        2,
      );
      const item3 = RoadmapItem.create(
        RoadmapItemId.create("i3"),
        "Item 3",
        "desc",
        3,
      );
      roadmap.addItem(item1);
      roadmap.addItem(item2);
      roadmap.addItem(item3);

      item1.markCompleted();

      expect(roadmap.progress).toBe(33);
    });
  });

  describe("updateItemStatus", () => {
    it("should update the status of a specific item by id", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const itemId = RoadmapItemId.create("i1");
      const item = RoadmapItem.create(itemId, "Item 1", "desc", 1);
      roadmap.addItem(item);

      roadmap.updateItemStatus(itemId, "completed");

      expect(roadmap.items[0].status).toBe("completed");
    });

    it("should throw error when item is not found", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const unknownId = RoadmapItemId.create("nonexistent");

      expect(() => roadmap.updateItemStatus(unknownId, "completed")).toThrow(
        "RoadmapItem not found",
      );
    });

    it("should update updatedAt when item status changes", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      const itemId = RoadmapItemId.create("i1");
      roadmap.addItem(RoadmapItem.create(itemId, "Item 1", "desc", 1));
      const beforeUpdate = roadmap.updatedAt;

      roadmap.updateItemStatus(itemId, "completed");

      expect(roadmap.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a Roadmap with items and preserved timestamps", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-15");
      const items = [
        RoadmapItem.reconstitute(
          RoadmapItemId.create("i1"),
          "Item 1",
          "desc",
          1,
          "completed",
        ),
        RoadmapItem.reconstitute(
          RoadmapItemId.create("i2"),
          "Item 2",
          "desc",
          2,
          "pending",
        ),
      ];

      const roadmap = Roadmap.reconstitute(
        roadmapId,
        goalId,
        "Path to Senior",
        items,
        createdAt,
        updatedAt,
      );

      expect(roadmap.items).toHaveLength(2);
      expect(roadmap.progress).toBe(50);
      expect(roadmap.createdAt).toEqual(createdAt);
      expect(roadmap.updatedAt).toEqual(updatedAt);
    });
  });

  describe("immutability", () => {
    it("should not allow direct modification of id", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");

      // @ts-expect-error - Testing immutability
      expect(() => (roadmap.id = RoadmapId.create("new-id"))).toThrow();
    });

    it("should not allow direct modification of goalId", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");

      // @ts-expect-error - Testing immutability
      expect(() => (roadmap.goalId = CareerGoalId.create("new"))).toThrow();
    });

    it("should return a copy of items array", () => {
      const roadmap = Roadmap.create(roadmapId, goalId, "Path to Senior");
      roadmap.addItem(
        RoadmapItem.create(RoadmapItemId.create("i1"), "Item 1", "desc", 1),
      );

      const items = roadmap.items;
      items.pop();

      expect(roadmap.items).toHaveLength(1);
    });
  });
});
