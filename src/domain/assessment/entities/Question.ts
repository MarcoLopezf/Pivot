import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";
import { DomainError } from "@domain/shared/errors/DomainError";

export class Question {
  private readonly _id: QuestionId;
  private readonly _text: string;
  private readonly _tags: string[];
  private readonly _difficulty: DifficultyLevel;
  private _usageCount: number;
  private readonly _options: QuestionOption[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: QuestionId,
    text: string,
    tags: string[],
    difficulty: DifficultyLevel,
    usageCount: number,
    options: QuestionOption[],
    createdAt: Date,
  ) {
    this._id = id;
    this._text = text;
    this._tags = tags;
    this._difficulty = difficulty;
    this._usageCount = usageCount;
    this._options = options;
    this._createdAt = createdAt;
    this._updatedAt = createdAt;
  }

  public static create(
    id: QuestionId,
    text: string,
    tags: string[],
    difficulty: DifficultyLevel,
    options: QuestionOption[],
  ): Question {
    if (text.trim().length === 0) {
      throw new DomainError("Question text cannot be empty");
    }
    if (tags.length === 0) {
      throw new DomainError("Question must have at least one tag");
    }
    if (!Object.values(DifficultyLevel).includes(difficulty)) {
      throw new DomainError(
        "Question difficulty must be a valid DifficultyLevel",
      );
    }
    return new Question(id, text, tags, difficulty, 0, options, new Date());
  }

  public static reconstitute(
    id: QuestionId,
    text: string,
    tags: string[],
    difficulty: DifficultyLevel,
    usageCount: number,
    options: QuestionOption[],
    createdAt: Date,
    updatedAt: Date,
  ): Question {
    const question = new Question(
      id,
      text,
      tags,
      difficulty,
      usageCount,
      options,
      createdAt,
    );
    question._updatedAt = updatedAt;
    return question;
  }

  public get id(): QuestionId {
    return this._id;
  }

  public get text(): string {
    return this._text;
  }

  public get tags(): string[] {
    return [...this._tags];
  }

  public get difficulty(): DifficultyLevel {
    return this._difficulty;
  }

  public get usageCount(): number {
    return this._usageCount;
  }

  public get options(): QuestionOption[] {
    return [...this._options];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public incrementUsage(): void {
    this._usageCount += 1;
    this._updatedAt = new Date();
  }
}
