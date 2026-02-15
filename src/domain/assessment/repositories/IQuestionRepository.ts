import { Question } from "@domain/assessment/entities/Question";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

export interface IQuestionRepository {
  findByTags(tags: string[], difficulty: DifficultyLevel): Promise<Question[]>;
  saveMany(questions: Question[]): Promise<void>;
  findById(id: QuestionId): Promise<Question | null>;
}
