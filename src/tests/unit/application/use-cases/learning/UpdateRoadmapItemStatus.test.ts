import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateRoadmapItemStatus } from "@application/use-cases/learning/UpdateRoadmapItemStatus";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

describe("UpdateRoadmapItemStatus Use Case", () => {
  let mockRepository: IRoadmapRepository;
  let useCase: UpdateRoadmapItemStatus;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
    };
    useCase = new UpdateRoadmapItemStatus(mockRepository);
  });

  it("should throw error when roadmap not found", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const dto = {
      roadmapId: "nonexistent",
      itemId: "item-001",
      status: "in_progress" as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it("should throw error when item not found", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    roadmap.addItem(
      RoadmapItem.create(RoadmapItemId.create("item-001"), "Item 1", "desc", 1),
    );

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "nonexistent",
      status: "in_progress" as const,
    };

    await expect(useCase.execute(dto)).rejects.toThrow();
  });

  it("should update item status from pending to in_progress", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-001"),
      "Item 1",
      "desc",
      1,
    );
    roadmap.addItem(item);

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRepository.save).mockResolvedValue(undefined);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "item-001",
      status: "in_progress" as const,
    };

    const result = await useCase.execute(dto);

    expect(result.items[0].status).toBe("in_progress");
    expect(mockRepository.save).toHaveBeenCalledWith(roadmap);
  });

  it("should update item status from in_progress to completed", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-001"),
      "Item 1",
      "desc",
      1,
    );
    item.markInProgress();
    roadmap.addItem(item);

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRepository.save).mockResolvedValue(undefined);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "item-001",
      status: "completed" as const,
    };

    const result = await useCase.execute(dto);

    expect(result.items[0].status).toBe("completed");
    expect(mockRepository.save).toHaveBeenCalledWith(roadmap);
  });

  it("should allow cycling from completed back to in_progress", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-001"),
      "Item 1",
      "desc",
      1,
    );
    item.markCompleted();
    roadmap.addItem(item);

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRepository.save).mockResolvedValue(undefined);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "item-001",
      status: "in_progress" as const,
    };

    const result = await useCase.execute(dto);

    expect(result.items[0].status).toBe("in_progress");
    expect(mockRepository.save).toHaveBeenCalledWith(roadmap);
  });

  it("should update progress calculation after status change", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    const item1 = RoadmapItem.create(
      RoadmapItemId.create("item-001"),
      "Item 1",
      "desc",
      1,
    );
    const item2 = RoadmapItem.create(
      RoadmapItemId.create("item-002"),
      "Item 2",
      "desc",
      2,
    );
    roadmap.addItem(item1);
    roadmap.addItem(item2);

    expect(roadmap.progress).toBe(0);

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRepository.save).mockResolvedValue(undefined);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "item-001",
      status: "completed" as const,
    };

    const result = await useCase.execute(dto);

    expect(result.progress).toBe(50);
  });

  it("should return updated RoadmapDTO", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    roadmap.addItem(
      RoadmapItem.create(RoadmapItemId.create("item-001"), "Item 1", "desc", 1),
    );

    vi.mocked(mockRepository.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRepository.save).mockResolvedValue(undefined);

    const dto = {
      roadmapId: "roadmap-001",
      itemId: "item-001",
      status: "in_progress" as const,
    };

    const result = await useCase.execute(dto);

    expect(result.id).toBe("roadmap-001");
    expect(result.goalId).toBe("goal-001");
    expect(result.title).toBe("Test Roadmap");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("item-001");
    expect(result.items[0].status).toBe("in_progress");
  });
});
