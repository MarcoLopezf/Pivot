import { describe, it, expect, vi, beforeEach } from "vitest";

let uuidCounter = 0;
vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => `mock-uuid-${++uuidCounter}`),
}));

import { GenerateQuiz } from "@application/use-cases/assessment/GenerateQuiz";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IQuestionRepository } from "@domain/assessment/repositories/IQuestionRepository";
import { IGenerateQuestionsFlow } from "@domain/assessment/services/IGenerateQuestionsFlow";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

function createQuestions(count: number): Question[] {
  return Array.from({ length: count }, (_, i) =>
    Question.create(
      QuestionId.create(`q-${i}`),
      `Question ${i}?`,
      ["test"],
      "beginner",
      [
        QuestionOption.create(
          QuestionOptionId.create(`opt-${i}-a`),
          "Right",
          true,
        ),
        QuestionOption.create(
          QuestionOptionId.create(`opt-${i}-b`),
          "Wrong",
          false,
        ),
      ],
    ),
  );
}

describe("GenerateQuiz Use Case", () => {
  let mockRoadmapRepo: IRoadmapRepository;
  let mockQuestionRepo: IQuestionRepository;
  let mockFlow: IGenerateQuestionsFlow;
  let useCase: GenerateQuiz;

  beforeEach(() => {
    mockRoadmapRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    mockQuestionRepo = {
      findByTags: vi.fn(),
      saveMany: vi.fn(),
      findById: vi.fn(),
    };
    mockFlow = { generate: vi.fn() };
    useCase = new GenerateQuiz(mockRoadmapRepo, mockQuestionRepo, mockFlow);
  });

  it("should throw when roadmap not found", async () => {
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("roadmap-1", "item-1")).rejects.toThrow(
      "Roadmap not found",
    );
  });

  it("should throw when item not found", async () => {
    const roadmap = Roadmap.create(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);

    await expect(useCase.execute("r-1", "nonexistent")).rejects.toThrow(
      "Roadmap item not found",
    );
  });

  it("should throw when item is project type", async () => {
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-1"),
      "Project",
      "desc",
      1,
      {
        type: "project",
      },
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [item],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);

    await expect(useCase.execute("r-1", "item-1")).rejects.toThrow(
      "Cannot generate quiz for PROJECT items",
    );
  });

  it("should return quiz when pool has enough questions", async () => {
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-1"),
      "Learn TS",
      "desc",
      1,
      {
        type: "theory",
        topic: "TypeScript",
        difficulty: "beginner",
      },
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [item],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockQuestionRepo.findByTags).mockResolvedValue(
      createQuestions(10),
    );
    vi.mocked(mockQuestionRepo.saveMany).mockResolvedValue(undefined);

    const result = await useCase.execute("r-1", "item-1");

    expect(result.roadmapItemId).toBe("item-1");
    expect(result.title).toBe("Quiz: Learn TS");
    expect(result.questions).toHaveLength(5);
    expect(result.questions[0].options.every((o) => !("isCorrect" in o))).toBe(
      true,
    );
  });

  it("should generate new questions when pool is insufficient", async () => {
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-1"),
      "Learn TS",
      "desc",
      1,
      {
        type: "theory",
        topic: "TypeScript",
        difficulty: "beginner",
      },
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [item],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockQuestionRepo.findByTags).mockResolvedValue(
      createQuestions(3),
    );
    vi.mocked(mockQuestionRepo.saveMany).mockResolvedValue(undefined);
    vi.mocked(mockFlow.generate).mockResolvedValue(
      Array.from({ length: 7 }, (_, i) => ({
        text: `AI Q${i}?`,
        options: [
          { text: "A", isCorrect: true },
          { text: "B", isCorrect: false },
        ],
      })),
    );

    const result = await useCase.execute("r-1", "item-1");

    expect(mockFlow.generate).toHaveBeenCalledWith("TypeScript", "beginner", 7);
    expect(result.questions).toHaveLength(5);
  });

  it("should return all questions when pool is less than quiz size", async () => {
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-1"),
      "Learn",
      "desc",
      1,
      {
        type: "theory",
        topic: "X",
        difficulty: "beginner",
      },
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [item],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockQuestionRepo.findByTags).mockResolvedValue(
      createQuestions(2),
    );
    vi.mocked(mockQuestionRepo.saveMany).mockResolvedValue(undefined);
    vi.mocked(mockFlow.generate).mockResolvedValue([]);

    const result = await useCase.execute("r-1", "item-1");

    expect(result.questions).toHaveLength(2);
  });

  it("should use item title when topic is empty", async () => {
    const item = RoadmapItem.create(
      RoadmapItemId.create("item-1"),
      "Closures",
      "desc",
      1,
      {
        type: "theory",
        topic: "",
        difficulty: "intermediate",
      },
    );
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [item],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockQuestionRepo.findByTags).mockResolvedValue([]);
    vi.mocked(mockQuestionRepo.saveMany).mockResolvedValue(undefined);
    vi.mocked(mockFlow.generate).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        text: `Q${i}?`,
        options: [
          { text: "A", isCorrect: true },
          { text: "B", isCorrect: false },
        ],
      })),
    );

    await useCase.execute("r-1", "item-1");

    expect(mockFlow.generate).toHaveBeenCalledWith(
      "Closures",
      "intermediate",
      10,
    );
    expect(mockQuestionRepo.findByTags).toHaveBeenCalledWith(
      [],
      "intermediate",
    );
  });
});
