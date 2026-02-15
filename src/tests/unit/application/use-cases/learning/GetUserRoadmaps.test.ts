import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserRoadmaps } from "@application/use-cases/learning/GetUserRoadmaps";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { UserId } from "@domain/profile/value-objects/UserId";

describe("GetUserRoadmaps Use Case", () => {
  let mockRoadmapRepo: IRoadmapRepository;
  let mockGoalRepo: ICareerGoalRepository;
  let useCase: GetUserRoadmaps;

  beforeEach(() => {
    mockRoadmapRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    mockGoalRepo = { save: vi.fn(), findById: vi.fn(), findByUserId: vi.fn() };
    useCase = new GetUserRoadmaps(mockRoadmapRepo, mockGoalRepo);
  });

  it("should return empty array when no roadmaps exist", async () => {
    vi.mocked(mockRoadmapRepo.findAllByUserId).mockResolvedValue([]);

    const result = await useCase.execute("user-1");

    expect(result).toEqual([]);
  });

  it("should return roadmap list with role from career goal", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "My Roadmap",
    );
    vi.mocked(mockRoadmapRepo.findAllByUserId).mockResolvedValue([roadmap]);

    const goal = CareerGoal.reconstitute(
      CareerGoalId.create("goal-1"),
      UserId.create("user-1"),
      "Senior Dev",
      "Junior Dev",
      new Date(),
      new Date(),
    );
    vi.mocked(mockGoalRepo.findById).mockResolvedValue(goal);

    const result = await useCase.execute("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("roadmap-1");
    expect(result[0].title).toBe("My Roadmap");
    expect(result[0].role).toBe("Senior Dev");
  });

  it("should return empty role when career goal not found", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "My Roadmap",
    );
    vi.mocked(mockRoadmapRepo.findAllByUserId).mockResolvedValue([roadmap]);
    vi.mocked(mockGoalRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("user-1");

    expect(result[0].role).toBe("");
  });

  it("should handle multiple roadmaps", async () => {
    const r1 = Roadmap.create(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Roadmap 1",
    );
    const r2 = Roadmap.create(
      RoadmapId.create("r-2"),
      CareerGoalId.create("g-2"),
      "Roadmap 2",
    );
    vi.mocked(mockRoadmapRepo.findAllByUserId).mockResolvedValue([r1, r2]);
    vi.mocked(mockGoalRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("user-1");

    expect(result).toHaveLength(2);
  });
});
