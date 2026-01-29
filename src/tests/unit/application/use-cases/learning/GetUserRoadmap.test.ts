import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserRoadmap } from "@application/use-cases/learning/GetUserRoadmap";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

describe("GetUserRoadmap Use Case", () => {
  let mockRepository: IRoadmapRepository;
  let useCase: GetUserRoadmap;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
    };
    useCase = new GetUserRoadmap(mockRepository);
  });

  it("should return null when no roadmap exists for user", async () => {
    vi.mocked(mockRepository.findLatestByUserId).mockResolvedValue(null);

    const result = await useCase.execute("user-001");

    expect(result).toBeNull();
    expect(mockRepository.findLatestByUserId).toHaveBeenCalledWith(
      expect.objectContaining({ value: "user-001" }),
    );
  });

  it("should throw when userId is empty", async () => {
    await expect(useCase.execute("")).rejects.toThrow();
  });

  it("should return RoadmapDTO when roadmap exists", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-001"),
      CareerGoalId.create("goal-001"),
      "Test Roadmap",
    );
    roadmap.addItem(
      RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "Learn TypeScript",
        "Study TS fundamentals",
        1,
      ),
    );
    roadmap.addItem(
      RoadmapItem.create(
        RoadmapItemId.create("item-002"),
        "Learn React",
        "Study React hooks",
        2,
      ),
    );

    vi.mocked(mockRepository.findLatestByUserId).mockResolvedValue(roadmap);

    const result = await useCase.execute("user-001");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("roadmap-001");
    expect(result!.goalId).toBe("goal-001");
    expect(result!.title).toBe("Test Roadmap");
    expect(result!.items).toHaveLength(2);
    expect(result!.items[0].title).toBe("Learn TypeScript");
    expect(result!.items[1].title).toBe("Learn React");
    expect(result!.progress).toBe(0);
  });

  it("should return latest roadmap when multiple exist", async () => {
    const latestRoadmap = Roadmap.create(
      RoadmapId.create("roadmap-002"),
      CareerGoalId.create("goal-001"),
      "Latest Roadmap",
    );
    latestRoadmap.addItem(
      RoadmapItem.create(
        RoadmapItemId.create("item-003"),
        "Advanced Topic",
        "desc",
        1,
      ),
    );

    vi.mocked(mockRepository.findLatestByUserId).mockResolvedValue(
      latestRoadmap,
    );

    const result = await useCase.execute("user-001");

    expect(result!.id).toBe("roadmap-002");
    expect(result!.title).toBe("Latest Roadmap");
  });

  it("should map roadmap items correctly including status", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-003"),
      CareerGoalId.create("goal-001"),
      "Roadmap with Status",
    );
    const item1 = RoadmapItem.create(
      RoadmapItemId.create("item-004"),
      "Item 1",
      "desc",
      1,
    );
    const item2 = RoadmapItem.create(
      RoadmapItemId.create("item-005"),
      "Item 2",
      "desc",
      2,
    );
    item2.markInProgress();

    roadmap.addItem(item1);
    roadmap.addItem(item2);

    vi.mocked(mockRepository.findLatestByUserId).mockResolvedValue(roadmap);

    const result = await useCase.execute("user-001");

    expect(result!.items[0].status).toBe("pending");
    expect(result!.items[1].status).toBe("in_progress");
  });

  it("should calculate progress correctly", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-004"),
      CareerGoalId.create("goal-001"),
      "Roadmap Progress Test",
    );
    const item1 = RoadmapItem.create(
      RoadmapItemId.create("item-006"),
      "Item 1",
      "desc",
      1,
    );
    const item2 = RoadmapItem.create(
      RoadmapItemId.create("item-007"),
      "Item 2",
      "desc",
      2,
    );
    item1.markCompleted();

    roadmap.addItem(item1);
    roadmap.addItem(item2);

    vi.mocked(mockRepository.findLatestByUserId).mockResolvedValue(roadmap);

    const result = await useCase.execute("user-001");

    expect(result!.progress).toBe(50);
  });
});
