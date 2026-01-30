import { Question } from "@domain/assessment/entities/Question";
import { QuestionId } from "@domain/assessment/value-objects/QuestionId";

export interface IQuestionRepository {
  findByTags(tags: string[], difficulty: string): Promise<Question[]>;
  saveMany(questions: Question[]): Promise<void>;
  findById(id: QuestionId): Promise<Question | null>;
}
