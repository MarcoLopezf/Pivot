import {
  type Question as PrismaQuestion,
  type QuestionOption as PrismaQuestionOption,
} from "@prisma/client";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

type PrismaQuestionWithOptions = PrismaQuestion & {
  options: PrismaQuestionOption[];
};

export class QuestionMapper {
  static toDomain(prismaQuestion: PrismaQuestionWithOptions): Question {
    const options = prismaQuestion.options.map((opt) =>
      QuestionOption.reconstitute(
        QuestionOptionId.create(opt.id),
        opt.text,
        opt.isCorrect,
      ),
    );

    return Question.reconstitute(
      QuestionId.create(prismaQuestion.id),
      prismaQuestion.text,
      prismaQuestion.tags,
      prismaQuestion.difficulty,
      prismaQuestion.usageCount,
      options,
      prismaQuestion.createdAt,
      prismaQuestion.updatedAt,
    );
  }

  static toPersistence(question: Question): {
    id: string;
    text: string;
    tags: string[];
    difficulty: string;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  } {
    return {
      id: question.id.value,
      text: question.text,
      tags: question.tags,
      difficulty: question.difficulty,
      usageCount: question.usageCount,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      options: question.options.map((opt) => ({
        id: opt.id.value,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    };
  }
}
