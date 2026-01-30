import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IQuestionRepository } from "@domain/assessment/repositories/IQuestionRepository";
import { IGenerateQuestionsFlow } from "@domain/assessment/services/IGenerateQuestionsFlow";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";
import { Question } from "@domain/assessment/entities/Question";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { QuizDTO } from "@application/dtos/assessment/QuizDTO";
import { randomUUID } from "crypto";

/**
 * GenerateQuiz Use Case
 *
 * Generates a quiz for a THEORY roadmap item using the "Smart Pool" strategy:
 * 1. Searches for existing questions matching topic/difficulty
 * 2. Generates new questions via AI if pool is insufficient
 * 3. Returns 5 random questions without exposing correct answers
 */
export class GenerateQuiz {
  private static readonly QUIZ_SIZE = 5;
  private static readonly MIN_POOL_SIZE = 10;

  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly generateQuestionsFlow: IGenerateQuestionsFlow,
  ) {}

  async execute(roadmapId: string, roadmapItemId: string): Promise<QuizDTO> {
    // 1. Validate roadmap item exists and is THEORY type
    const roadmapIdVO = RoadmapId.create(roadmapId);
    const itemIdVO = RoadmapItemId.create(roadmapItemId);

    const roadmap = await this.roadmapRepository.findById(roadmapIdVO);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const item = roadmap.items.find((i) => i.id.equals(itemIdVO));
    if (!item) {
      throw new Error("Roadmap item not found");
    }

    if (item.type !== "theory") {
      throw new Error(
        "Cannot generate quiz for PROJECT items. Use URL submission instead.",
      );
    }

    // 2. Search for existing questions in the pool
    const tags = item.topic ? [item.topic] : [];
    const existingQuestions = await this.questionRepository.findByTags(
      tags,
      item.difficulty,
    );

    // 3. Generate more questions if pool is insufficient
    let allQuestions = existingQuestions;
    if (existingQuestions.length < GenerateQuiz.MIN_POOL_SIZE) {
      const neededCount = GenerateQuiz.MIN_POOL_SIZE - existingQuestions.length;
      const newQuestions = await this.generateAndSaveQuestions(
        item.topic || item.title,
        item.difficulty,
        neededCount,
      );
      allQuestions = [...existingQuestions, ...newQuestions];
    }

    // 4. Select random questions for the quiz
    const selectedQuestions = this.selectRandomQuestions(
      allQuestions,
      GenerateQuiz.QUIZ_SIZE,
    );

    // 5. Increment usage count for selected questions
    for (const q of selectedQuestions) {
      q.incrementUsage();
    }
    await this.questionRepository.saveMany(selectedQuestions);

    // 6. Map to DTO (without isCorrect flags)
    return {
      roadmapItemId: item.id.value,
      title: `Quiz: ${item.title}`,
      difficulty: item.difficulty,
      questions: selectedQuestions.map((q) => ({
        id: q.id.value,
        text: q.text,
        options: q.options.map((opt) => ({
          id: opt.id.value,
          text: opt.text,
          // IMPORTANT: Do NOT include isCorrect flag in DTO
        })),
      })),
    };
  }

  private async generateAndSaveQuestions(
    topic: string,
    difficulty: string,
    count: number,
  ): Promise<Question[]> {
    const generatedData = await this.generateQuestionsFlow.generate(
      topic,
      difficulty,
      count,
    );

    const questions: Question[] = [];
    for (const qData of generatedData) {
      const questionId = QuestionId.create(randomUUID());
      const options = qData.options.map((optData) =>
        QuestionOption.create(
          QuestionOptionId.create(randomUUID()),
          optData.text,
          optData.isCorrect,
        ),
      );

      const question = Question.create(
        questionId,
        qData.text,
        [topic], // Use topic as tag
        difficulty,
        options,
      );

      questions.push(question);
    }

    await this.questionRepository.saveMany(questions);
    return questions;
  }

  private selectRandomQuestions(
    questions: Question[],
    count: number,
  ): Question[] {
    if (questions.length <= count) {
      return questions;
    }

    // Fisher-Yates shuffle
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }
}
