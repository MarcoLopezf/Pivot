import { describe, it, expect } from "vitest";
import { QuestionMapper } from "@infrastructure/database/mappers/QuestionMapper";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

describe("QuestionMapper", () => {
  const now = new Date("2024-01-01");
  const later = new Date("2024-06-01");

  describe("toDomain", () => {
    it("should convert Prisma model with options to domain entity", () => {
      const prismaQuestion = {
        id: "q-1",
        text: "What is TypeScript?",
        tags: ["typescript", "basics"],
        difficulty: "beginner",
        usageCount: 5,
        createdAt: now,
        updatedAt: later,
        options: [
          {
            id: "opt-1",
            questionId: "q-1",
            text: "A language",
            isCorrect: true,
          },
          {
            id: "opt-2",
            questionId: "q-1",
            text: "A framework",
            isCorrect: false,
          },
        ],
      };

      const domain = QuestionMapper.toDomain(prismaQuestion);

      expect(domain.id.value).toBe("q-1");
      expect(domain.text).toBe("What is TypeScript?");
      expect(domain.tags).toEqual(["typescript", "basics"]);
      expect(domain.difficulty).toBe("beginner");
      expect(domain.usageCount).toBe(5);
      expect(domain.options).toHaveLength(2);
      expect(domain.options[0].id.value).toBe("opt-1");
      expect(domain.options[0].isCorrect).toBe(true);
      expect(domain.options[1].isCorrect).toBe(false);
    });

    it("should handle empty options array", () => {
      const prismaQuestion = {
        id: "q-2",
        text: "Empty question",
        tags: ["test"],
        difficulty: "beginner",
        usageCount: 0,
        createdAt: now,
        updatedAt: later,
        options: [],
      };

      const domain = QuestionMapper.toDomain(prismaQuestion);

      expect(domain.options).toHaveLength(0);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain entity to Prisma format", () => {
      const question = Question.reconstitute(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        3,
        [
          QuestionOption.reconstitute(
            QuestionOptionId.create("opt-1"),
            "A language",
            true,
          ),
          QuestionOption.reconstitute(
            QuestionOptionId.create("opt-2"),
            "A framework",
            false,
          ),
        ],
        now,
        later,
      );

      const persistence = QuestionMapper.toPersistence(question);

      expect(persistence.id).toBe("q-1");
      expect(persistence.text).toBe("What is TypeScript?");
      expect(persistence.tags).toEqual(["typescript"]);
      expect(persistence.difficulty).toBe("beginner");
      expect(persistence.usageCount).toBe(3);
      expect(persistence.options).toHaveLength(2);
      expect(persistence.options[0]).toEqual({
        id: "opt-1",
        text: "A language",
        isCorrect: true,
      });
    });
  });
});
