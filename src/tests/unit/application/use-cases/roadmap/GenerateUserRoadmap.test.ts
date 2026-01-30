import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import {
  IGenerateRoadmapFlow,
  GeneratedRoadmapItem,
} from "@domain/learning/services/IGenerateRoadmapFlow";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { PdfService } from "@infrastructure/services/PdfService";

describe("GenerateUserRoadmap Use Case", () => {
  let mockRepository: IRoadmapRepository;
  let mockFlow: IGenerateRoadmapFlow;
  let mockPdfService: PdfService;
  let useCase: GenerateUserRoadmap;

  const staticItems: GeneratedRoadmapItem[] = [
    {
      title: "Learn TypeScript Generics",
      description: "Master advanced generic patterns for type-safe APIs",
      order: 1,
      status: "pending",
    },
    {
      title: "Study System Design",
      description: "Learn distributed systems fundamentals",
      order: 2,
      status: "pending",
    },
    {
      title: "Build a Portfolio Project",
      description: "Create a full-stack application showcasing skills",
      order: 3,
      status: "pending",
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

    mockPdfService = {
      extractText: vi.fn(),
    } as unknown as PdfService;

    useCase = new GenerateUserRoadmap(mockRepository, mockFlow, mockPdfService);
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
        undefined, // No user context
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

  describe("User Context - Experience Summary", () => {
    it("should pass experience summary as user context to AI flow", async () => {
      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        experienceSummary:
          "I have 3 years of experience with React and TypeScript",
      };

      await useCase.execute(dto);

      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        expect.stringContaining("EXPERIENCE SUMMARY"),
      );
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        expect.stringContaining(
          "I have 3 years of experience with React and TypeScript",
        ),
      );
    });
  });

  describe("User Context - CV Upload", () => {
    it("should extract text from CV and pass as user context", async () => {
      const mockCvBuffer = Buffer.from("mock cv");
      const mockCvText =
        "John Doe\nSoftware Engineer\n5 years experience with Node.js";

      vi.mocked(mockPdfService.extractText).mockResolvedValue(mockCvText);

      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        cvFile: mockCvBuffer,
      };

      await useCase.execute(dto);

      expect(mockPdfService.extractText).toHaveBeenCalledWith(mockCvBuffer);
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        expect.stringContaining("CV CONTENT"),
      );
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        expect.stringContaining("5 years experience with Node.js"),
      );
    });

    it("should combine experience summary and CV text", async () => {
      const mockCvBuffer = Buffer.from("mock cv");
      const mockCvText = "Work Experience:\n- React Developer at Company X";

      vi.mocked(mockPdfService.extractText).mockResolvedValue(mockCvText);

      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        experienceSummary: "Expert in TypeScript",
        cvFile: mockCvBuffer,
      };

      await useCase.execute(dto);

      const callArg = vi.mocked(mockFlow.generate).mock.calls[0][2];
      expect(callArg).toContain("EXPERIENCE SUMMARY");
      expect(callArg).toContain("Expert in TypeScript");
      expect(callArg).toContain("CV CONTENT");
      expect(callArg).toContain("React Developer");
    });

    it("should handle CV extraction failure gracefully", async () => {
      const mockCvBuffer = Buffer.from("corrupted cv");

      vi.mocked(mockPdfService.extractText).mockRejectedValue(
        new Error("Failed to extract text from PDF: Invalid structure"),
      );

      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        cvFile: mockCvBuffer,
      };

      // Should not throw - continues without CV context
      await expect(useCase.execute(dto)).resolves.toBeDefined();

      // Verify it still called the AI flow (without CV context)
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        undefined,
      );
    });

    it("should ignore empty CV text", async () => {
      const mockCvBuffer = Buffer.from("mock cv");

      vi.mocked(mockPdfService.extractText).mockResolvedValue("   \n\n   ");

      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        cvFile: mockCvBuffer,
      };

      await useCase.execute(dto);

      // Should not include CV context since it's only whitespace
      expect(mockFlow.generate).toHaveBeenCalledWith(
        "Junior Developer",
        "Senior Developer",
        undefined,
      );
    });
  });

  describe("AI-Determined Status", () => {
    it("should use AI-determined status for roadmap items", async () => {
      const itemsWithStatus: GeneratedRoadmapItem[] = [
        {
          title: "React Basics",
          description: "Learn React fundamentals",
          order: 1,
          status: "completed", // User already knows this
        },
        {
          title: "Advanced React Patterns",
          description: "Master advanced patterns",
          order: 2,
          status: "in_progress", // User has some exposure
        },
        {
          title: "GraphQL",
          description: "Learn GraphQL",
          order: 3,
          status: "pending", // User needs to learn
        },
      ];

      vi.mocked(mockFlow.generate).mockResolvedValue(itemsWithStatus);

      const dto = {
        goalId: "goal-001",
        currentRole: "Junior Developer",
        targetRole: "Senior Developer",
        experienceSummary: "I have worked with React for 2 years",
      };

      const result = await useCase.execute(dto);

      expect(result.items[0].status).toBe("completed");
      expect(result.items[1].status).toBe("in_progress");
      expect(result.items[2].status).toBe("pending");
    });
  });
});
