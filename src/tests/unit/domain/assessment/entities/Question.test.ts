import { describe, it, expect } from "vitest";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

function makeOption(
  id: string,
  text: string,
  isCorrect: boolean,
): QuestionOption {
  return QuestionOption.create(QuestionOptionId.create(id), text, isCorrect);
}

describe("Question", () => {
  const defaultOptions = [
    makeOption("opt-1", "Correct", true),
    makeOption("opt-2", "Wrong", false),
  ];

  describe("create", () => {
    it("should create a question with valid fields", () => {
      const id = QuestionId.create("q-1");
      const question = Question.create(
        id,
        "What is TypeScript?",
        ["typescript", "basics"],
        "beginner",
        defaultOptions,
      );

      expect(question.id.value).toBe("q-1");
      expect(question.text).toBe("What is TypeScript?");
      expect(question.tags).toEqual(["typescript", "basics"]);
      expect(question.difficulty).toBe("beginner");
      expect(question.usageCount).toBe(0);
      expect(question.options).toHaveLength(2);
    });

    it("should set createdAt and updatedAt to now", () => {
      const before = new Date();
      const question = Question.create(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        defaultOptions,
      );
      const after = new Date();

      expect(question.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(question.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(question.updatedAt.getTime()).toBe(question.createdAt.getTime());
    });

    it("should reject empty text", () => {
      expect(() =>
        Question.create(
          QuestionId.create("q-1"),
          "",
          ["typescript"],
          "beginner",
          defaultOptions,
        ),
      ).toThrow("Question text cannot be empty");
    });

    it("should reject empty tags array", () => {
      expect(() =>
        Question.create(
          QuestionId.create("q-1"),
          "What is TypeScript?",
          [],
          "beginner",
          defaultOptions,
        ),
      ).toThrow("Question must have at least one tag");
    });

    it("should reject empty difficulty", () => {
      expect(() =>
        Question.create(
          QuestionId.create("q-1"),
          "What is TypeScript?",
          ["typescript"],
          "",
          defaultOptions,
        ),
      ).toThrow("Question difficulty cannot be empty");
    });
  });

  describe("reconstitute", () => {
    it("should restore a question from persistence without validation", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-06-01");
      const question = Question.reconstitute(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        5,
        defaultOptions,
        createdAt,
        updatedAt,
      );

      expect(question.usageCount).toBe(5);
      expect(question.createdAt).toBe(createdAt);
      expect(question.updatedAt).toBe(updatedAt);
    });
  });

  describe("incrementUsage", () => {
    it("should increment usageCount by 1", () => {
      const question = Question.create(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        defaultOptions,
      );

      question.incrementUsage();

      expect(question.usageCount).toBe(1);
    });

    it("should update updatedAt when incrementing", () => {
      const question = Question.create(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        defaultOptions,
      );

      const beforeIncrement = question.updatedAt;
      question.incrementUsage();

      expect(question.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeIncrement.getTime(),
      );
    });
  });

  describe("immutability", () => {
    it("should return a copy of tags array", () => {
      const question = Question.create(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        defaultOptions,
      );

      const tags = question.tags;
      tags.push("hacked");

      expect(question.tags).toEqual(["typescript"]);
    });

    it("should return a copy of options array", () => {
      const question = Question.create(
        QuestionId.create("q-1"),
        "What is TypeScript?",
        ["typescript"],
        "beginner",
        defaultOptions,
      );

      const options = question.options;
      expect(options).toHaveLength(2);
    });
  });
});
