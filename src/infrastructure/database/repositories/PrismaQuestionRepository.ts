import { type PrismaClient } from "@prisma/client";
import { IQuestionRepository } from "@domain/assessment/repositories/IQuestionRepository";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionMapper } from "@infrastructure/database/mappers/QuestionMapper";

export class PrismaQuestionRepository implements IQuestionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByTags(tags: string[], difficulty: string): Promise<Question[]> {
    const prismaQuestions = await this.db.question.findMany({
      where: {
        tags: { hasSome: tags },
        difficulty,
      },
      include: { options: true },
      orderBy: { usageCount: "asc" },
    });

    return prismaQuestions.map((q) => QuestionMapper.toDomain(q));
  }

  async saveMany(questions: Question[]): Promise<void> {
    await this.db.$transaction(
      async (tx) => {
        for (const question of questions) {
          const data = QuestionMapper.toPersistence(question);

          await tx.question.upsert({
            where: { id: data.id },
            create: {
              id: data.id,
              text: data.text,
              tags: data.tags,
              difficulty: data.difficulty,
              usageCount: data.usageCount,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            },
            update: {
              text: data.text,
              tags: data.tags,
              difficulty: data.difficulty,
              usageCount: data.usageCount,
              updatedAt: data.updatedAt,
            },
          });

          await tx.questionOption.deleteMany({
            where: { questionId: data.id },
          });

          if (data.options.length > 0) {
            await tx.questionOption.createMany({
              data: data.options.map((opt) => ({
                id: opt.id,
                questionId: data.id,
                text: opt.text,
                isCorrect: opt.isCorrect,
              })),
            });
          }
        }
      },
      {
        timeout: 30000, // 30 seconds timeout for AI generation + DB operations
      },
    );
  }

  async findById(id: QuestionId): Promise<Question | null> {
    const prismaQuestion = await this.db.question.findUnique({
      where: { id: id.value },
      include: { options: true },
    });

    if (!prismaQuestion) return null;
    return QuestionMapper.toDomain(prismaQuestion);
  }
}
