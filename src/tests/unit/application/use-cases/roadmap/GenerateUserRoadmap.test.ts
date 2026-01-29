import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import {
  IGenerateRoadmapFlow,
  GeneratedRoadmapItem,
} from "@domain/learning/services/IGenerateRoadmapFlow";
import { Roadmap } from "@domain/learning/entities/Roadmap";

describe("GenerateUserRoadmap Use Case", () => {
  let mockRepository: IRoadmapRepository;
  let mockFlow: IGenerateRoadmapFlow;
  let useCase: GenerateUserRoadmap;

  const staticItems: GeneratedRoadmapItem[] = [
    {
      title: "Learn TypeScript Generics",
      description: "Master advanced generic patterns for type-safe APIs",
      order: 1,
    },
    {
      title: "Study System Design",
      description: "Learn distributed systems fundamentals",
      order: 2,
    },
    {
      title: "Build a Portfolio Project",
      description: "Create a full-stack application showcasing skills",
      order: 3,
    },
  ];

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
    };

    mockFlow = {
      generate: vi.fn().mockResolvedValue(staticItems),
    };

    useCase = new GenerateUserRoadmap(mockRepository, mockFlow);
  });

  describe("execute", () => {
    it("should call the AI flow with currentRole and targetRole", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await useCase.execute(dto);

      expect(mockFlow.generate).toHaveBeenCalledTimes(1);
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
      );
    });

    it("should save a Roadmap entity via the repository", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await useCase.execute(dto);

      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      const saveMock = mockRepository.save as Mock;
      const savedRoadmap = saveMock.mock.calls[0][0] as Roadmap;
      expect(savedRoadmap).toBeInstanceOf(Roadmap);
    });

    it("should save the roadmap with all items from the AI flow", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await useCase.execute(dto);

      const saveMock = mockRepository.save as Mock;
      const savedRoadmap = saveMock.mock.calls[0][0] as Roadmap;

      expect(savedRoadmap.items).toHaveLength(3);
      expect(savedRoadmap.items[0].title).toBe("Learn TypeScript Generics");
      expect(savedRoadmap.items[1].title).toBe("Study System Design");
      expect(savedRoadmap.items[2].title).toBe("Build a Portfolio Project");
    });

    it("should set the correct goalId on the roadmap", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await useCase.execute(dto);

      const saveMock = mockRepository.save as Mock;
      const savedRoadmap = saveMock.mock.calls[0][0] as Roadmap;

      expect(savedRoadmap.goalId.value).toBe("goal-001");
    });

    it("should generate a title based on targetRole", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await useCase.execute(dto);

      const saveMock = mockRepository.save as Mock;
      const savedRoadmap = saveMock.mock.calls[0][0] as Roadmap;

      expect(savedRoadmap.title).toBe("Roadmap to Senior Developer");
    });

    it("should return a RoadmapDTO with correct data", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      const result = await useCase.execute(dto);

      expect(result.goalId).toBe("goal-001");
      expect(result.title).toBe("Roadmap to Senior Developer");
      expect(result.progress).toBe(0);
      expect(result.items).toHaveLength(3);
      expect(result.items[0]).toMatchObject({
        title: "Learn TypeScript Generics",
        description: "Master advanced generic patterns for type-safe APIs",
        order: 1,
        status: "pending",
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should set all item statuses to pending", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      const result = await useCase.execute(dto);

      result.items.forEach((item) => {
        expect(item.status).toBe("pending");
      });
    });

    it("should throw error when goalId is empty", async () => {
      const dto = {
        goalId: "",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
      };

      await expect(useCase.execute(dto)).rejects.toThrow();

      expect(mockFlow.generate).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
