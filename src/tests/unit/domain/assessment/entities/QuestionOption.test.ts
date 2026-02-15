import { describe, it, expect } from "vitest";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

describe("QuestionOption", () => {
  describe("create", () => {
    it("should create an option with valid text and isCorrect flag", () => {
      const id = QuestionOptionId.create("opt-1");
      const option = QuestionOption.create(id, "Answer A", true);

      expect(option.id.value).toBe("opt-1");
      expect(option.text).toBe("Answer A");
      expect(option.isCorrect).toBe(true);
    });

    it("should create an incorrect option", () => {
      const id = QuestionOptionId.create("opt-2");
      const option = QuestionOption.create(id, "Wrong answer", false);

      expect(option.isCorrect).toBe(false);
    });

    it("should reject empty text", () => {
      const id = QuestionOptionId.create("opt-1");
      expect(() => QuestionOption.create(id, "", true)).toThrow(
        "QuestionOption text cannot be empty",
      );
    });

    it("should reject whitespace-only text", () => {
      const id = QuestionOptionId.create("opt-1");
      expect(() => QuestionOption.create(id, "   ", false)).toThrow(
        "QuestionOption text cannot be empty",
      );
    });
  });

  describe("reconstitute", () => {
    it("should bypass validation and restore from persistence", () => {
      const id = QuestionOptionId.create("opt-1");
      const option = QuestionOption.reconstitute(id, "Answer A", true);

      expect(option.id.value).toBe("opt-1");
      expect(option.text).toBe("Answer A");
      expect(option.isCorrect).toBe(true);
    });
  });
});
