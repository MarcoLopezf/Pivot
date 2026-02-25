import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "mock-attempt-uuid"),
}));

import { SubmitQuiz } from "@application/use-cases/assessment/SubmitQuiz";
import { IQuestionRepository } from "@domain/assessment/repositories/IQuestionRepository";
import { IQuizAttemptRepository } from "@domain/assessment/repositories/IQuizAttemptRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

function createQuestion(id: string, correctOptionId: string): Question {
  return Question.create(
    QuestionId.create(id),
    `Q ${id}?`,
    ["test"],
    DifficultyLevel.Beginner,
    [
      QuestionOption.create(
        QuestionOptionId.create(correctOptionId),
        "Correct",
        true,
      ),
      QuestionOption.create(
        QuestionOptionId.create(`${id}-wrong`),
        "Wrong",
        false,
      ),
    ],
  );
}

describe("SubmitQuiz Use Case", () => {
  let mockQuestionRepo: IQuestionRepository;
  let mockAttemptRepo: IQuizAttemptRepository;
  let mockRoadmapRepo: IRoadmapRepository;
  let useCase: SubmitQuiz;

  beforeEach(() => {
    mockQuestionRepo = {
      findByTags: vi.fn(),
      saveMany: vi.fn(),
      findById: vi.fn(),
    };
    mockAttemptRepo = {
      save: vi.fn(),
      findByRoadmapItemId: vi.fn(),
      findByUserId: vi.fn(),
      getStatsForRoadmap: vi.fn(),
    };
    mockRoadmapRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
      findAllByUserId: vi.fn(),
      countByUserId: vi.fn(),
      findOwnerUserId: vi.fn(),
    };
    useCase = new SubmitQuiz(
      mockQuestionRepo,
      mockAttemptRepo,
      mockRoadmapRepo,
    );
  });

  it("should throw when no answers provided", async () => {
    await expect(
      useCase.execute({
        userId: "user-1",
        roadmapId: "r-1",
        roadmapItemId: "i-1",
        answers: [],
      }),
    ).rejects.toThrow("No answers provided");
  });

  it("should throw when roadmap has no owner", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: "user-1",
        roadmapId: "r-1",
        roadmapItemId: "i-1",
        answers: [{ questionId: "q-1", selectedOptionId: "opt-1" }],
      }),
    ).rejects.toThrow("Roadmap not found or has no owner");
  });

  it("should throw authorization error when userId does not match roadmap owner", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("owner-user"),
    );

    await expect(
      useCase.execute({
        userId: "different-user",
        roadmapId: "r-1",
        roadmapItemId: "i-1",
        answers: [{ questionId: "q-1", selectedOptionId: "opt-1" }],
      }),
    ).rejects.toThrow("AUTHORIZATION_ERROR");
  });

  it("should throw when some questions not found", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    vi.mocked(mockQuestionRepo.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: "user-1",
        roadmapId: "r-1",
        roadmapItemId: "i-1",
        answers: [{ questionId: "q-1", selectedOptionId: "opt-1" }],
      }),
    ).rejects.toThrow("Some question IDs are invalid");
  });

  it("should return passing result when score >= 70", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );

    const q1 = createQuestion("q-1", "opt-correct-1");
    const q2 = createQuestion("q-2", "opt-correct-2");
    vi.mocked(mockQuestionRepo.findById)
      .mockResolvedValueOnce(q1)
      .mockResolvedValueOnce(q2);
    vi.mocked(mockAttemptRepo.save).mockResolvedValue(undefined);

    // Answer both correctly → 100%
    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [RoadmapItem.create(RoadmapItemId.create("i-1"), "Item", "desc", 1)],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRoadmapRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: "user-1",
      roadmapId: "r-1",
      roadmapItemId: "i-1",
      answers: [
        { questionId: "q-1", selectedOptionId: "opt-correct-1" },
        { questionId: "q-2", selectedOptionId: "opt-correct-2" },
      ],
    });

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.correctCount).toBe(2);
    expect(result.totalCount).toBe(2);
    expect(result.feedback).toContain("Perfect score");
  });

  it("should return failing result when score < 70", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );

    const q1 = createQuestion("q-1", "opt-correct-1");
    const q2 = createQuestion("q-2", "opt-correct-2");
    const q3 = createQuestion("q-3", "opt-correct-3");
    vi.mocked(mockQuestionRepo.findById)
      .mockResolvedValueOnce(q1)
      .mockResolvedValueOnce(q2)
      .mockResolvedValueOnce(q3);
    vi.mocked(mockAttemptRepo.save).mockResolvedValue(undefined);

    // Answer 1 of 3 correctly → 33%
    const result = await useCase.execute({
      userId: "user-1",
      roadmapId: "r-1",
      roadmapItemId: "i-1",
      answers: [
        { questionId: "q-1", selectedOptionId: "opt-correct-1" },
        { questionId: "q-2", selectedOptionId: "wrong" },
        { questionId: "q-3", selectedOptionId: "wrong" },
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBe(33);
    expect(result.feedback).toContain("70% to pass");
  });

  it("should not update roadmap when quiz failed", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );
    const q1 = createQuestion("q-1", "opt-correct-1");
    vi.mocked(mockQuestionRepo.findById).mockResolvedValue(q1);
    vi.mocked(mockAttemptRepo.save).mockResolvedValue(undefined);

    await useCase.execute({
      userId: "user-1",
      roadmapId: "r-1",
      roadmapItemId: "i-1",
      answers: [{ questionId: "q-1", selectedOptionId: "wrong" }],
    });

    expect(mockRoadmapRepo.findById).not.toHaveBeenCalled();
  });

  it("should return score 90 feedback tier", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );

    // 9 of 10 correct = 90%
    const questions = Array.from({ length: 10 }, (_, i) =>
      createQuestion(`q-${i}`, `opt-c-${i}`),
    );
    for (const q of questions) {
      vi.mocked(mockQuestionRepo.findById).mockResolvedValueOnce(q);
    }
    vi.mocked(mockAttemptRepo.save).mockResolvedValue(undefined);

    const roadmap = Roadmap.reconstitute(
      RoadmapId.create("r-1"),
      CareerGoalId.create("g-1"),
      "Test",
      [RoadmapItem.create(RoadmapItemId.create("i-1"), "Item", "desc", 1)],
      new Date(),
      new Date(),
    );
    vi.mocked(mockRoadmapRepo.findById).mockResolvedValue(roadmap);
    vi.mocked(mockRoadmapRepo.save).mockResolvedValue(undefined);

    const answers = questions.map((q, i) => ({
      questionId: q.id.value,
      selectedOptionId: i < 9 ? `opt-c-${i}` : "wrong",
    }));

    const result = await useCase.execute({
      userId: "user-1",
      roadmapId: "r-1",
      roadmapItemId: "i-1",
      answers,
    });

    expect(result.score).toBe(90);
    expect(result.feedback).toContain("Outstanding");
  });

  it("should return >=50 failed feedback tier", async () => {
    vi.mocked(mockRoadmapRepo.findOwnerUserId).mockResolvedValue(
      UserId.create("user-1"),
    );

    // 1 of 2 correct = 50%
    const q1 = createQuestion("q-1", "opt-c-1");
    const q2 = createQuestion("q-2", "opt-c-2");
    vi.mocked(mockQuestionRepo.findById)
      .mockResolvedValueOnce(q1)
      .mockResolvedValueOnce(q2);
    vi.mocked(mockAttemptRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: "user-1",
      roadmapId: "r-1",
      roadmapItemId: "i-1",
      answers: [
        { questionId: "q-1", selectedOptionId: "opt-c-1" },
        { questionId: "q-2", selectedOptionId: "wrong" },
      ],
    });

    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain("close");
  });
});
