import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetRoadmapById } from "@application/use-cases/learning/GetRoadmapById";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { UserId } from "@domain/profile/value-objects/UserId";

describe("GetRoadmapById Use Case", () => {
  let mockRoadmapRepo: IRoadmapRepository;
  let mockGoalRepo: ICareerGoalRepository;
  let useCase: GetRoadmapById;

  beforeEach(() => {
    mockRoadmapRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    mockGoalRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
    };
    useCase = new GetRoadmapById(mockRoadmapRepo, mockGoalRepo);
  });

  it("should return null when owner does not match", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("other-user"),
    );

    const result = await useCase.execute("roadmap-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return null when no owner found", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(null);

    const result = await useCase.execute("roadmap-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return null when roadmap not found after ownership check", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("roadmap-1", "user-1");

    expect(result).toBeNull();
  });

  it("should return RoadmapOverviewDTO with career goal context", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
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
            difficulty: "beginner",
          },
        ),
      ],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);

    const goal = CareerGoal.reconstitute(
      CareerGoalId.create("goal-1"),
      UserId.create("user-1"),
      "Senior Dev",
      "Junior Dev",
      new Date(),
      new Date(),
    );
    vi.mocked(mockGoalRepo.findById).mockResolvedValue(goal);

    const result = await useCase.execute("roadmap-1", "user-1");

    expect(result).not.toBeNull();
    expect(result!.roadmap.id).toBe("roadmap-1");
    expect(result!.roadmap.title).toBe("My Roadmap");
    expect(result!.roadmap.items).toHaveLength(1);
    expect(result!.targetRole).toBe("Senior Dev");
    expect(result!.currentRole).toBe("Junior Dev");
  });

  it("should return empty strings when career goal not found", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "My Roadmap",
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockGoalRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("roadmap-1", "user-1");

    expect(result!.targetRole).toBe("");
    expect(result!.currentRole).toBe("");
  });
});
