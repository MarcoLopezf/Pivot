import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetLastActiveRoadmap } from "@application/use-cases/learning/GetLastActiveRoadmap";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

describe("GetLastActiveRoadmap Use Case", () => {
  let mockRepo: IRoadmapRepository;
  let useCase: GetLastActiveRoadmap;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      countByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    useCase = new GetLastActiveRoadmap(mockRepo);
  });

  it("should return roadmap id when a roadmap exists", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("roadmap-1"),
      CareerGoalId.create("goal-1"),
      "Test Roadmap",
    );
    vi.mocked(mockRepo.findLatestByUserId).mockResolvedValue(roadmap);

    const result = await useCase.execute("user-1");

    expect(result).toBe("roadmap-1");
  });

  it("should return null when no roadmap exists", async () => {
    vi.mocked(mockRepo.findLatestByUserId).mockResolvedValue(null);

    const result = await useCase.execute("user-1");

    expect(result).toBeNull();
  });

  it("should throw when userId is empty", async () => {
    await expect(useCase.execute("")).rejects.toThrow();
  });
});
