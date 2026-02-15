import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetRoadmapItemById } from "@application/use-cases/learning/GetRoadmapItemById";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

describe("GetRoadmapItemById Use Case", () => {
  let mockRepo: IRoadmapRepository;
  let useCase: GetRoadmapItemById;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    useCase = new GetRoadmapItemById(mockRepo);
  });

  it("should return null when owner does not match", async () => {
    vi.mocked(mockRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("other"),
    );

    const result = await useCase.execute("roadmap-1", "item-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return null when no owner found", async () => {
    vi.mocked(mockRepo.findOwnerUserId).mockResolvedValue(null);

    const result = await useCase.execute("roadmap-1", "item-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return null when roadmap not found", async () => {
    vi.mocked(mockRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("roadmap-1", "item-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return null when item not found in roadmap", async () => {
    vi.mocked(mockRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "Test",
    );
    vi.mocked(mockRepo.findById).mockResolvedValue(roadmap);

    const result = await useCase.execute("roadmap-1", "nonexistent", "user-1");

    expect(result).toBeNull();
  });

  it("should return item detail DTO when found", async () => {
    vi.mocked(mockRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "My Roadmap",
      [
        RoadmapItem.create(
          RoadmapItemId.create("item-1"),
          "Learn TS",
          "desc",
          1,
          {
            type: "theory",
            tags: ["typescript"],
            difficulty: DifficultyLevel.Beginner,
          },
        ),
      ],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRepo.findById).mockResolvedValue(roadmap);

    const result = await useCase.execute("roadmap-1", "item-1", "user-1");

    expect(result).not.toBeNull();
    expect(result!.item.id).toBe("item-1");
    expect(result!.item.title).toBe("Learn TS");
    expect(result!.roadmapId).toBe("roadmap-1");
    expect(result!.roadmapTitle).toBe("My Roadmap");
    expect(result!.totalItems).toBe(1);
  });
});
