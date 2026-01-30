import { QuestionId } from "@domain/assessment/value-objects/QuestionId";
import { QuestionOption } from "@domain/assessment/entities/QuestionOption";

export class Question {
  private readonly _id: QuestionId;
  private readonly _text: string;
  private readonly _tags: string[];
  private readonly _difficulty: string;
  private _usageCount: number;
  private readonly _options: QuestionOption[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: QuestionId,
    text: string,
    tags: string[],
    difficulty: string,
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
    difficulty: string,
    options: QuestionOption[],
  ): Question {
    if (text.trim().length === 0) {
      throw new Error("Question text cannot be empty");
    }
    if (tags.length === 0) {
      throw new Error("Question must have at least one tag");
    }
    if (difficulty.trim().length === 0) {
      throw new Error("Question difficulty cannot be empty");
    }
    return new Question(id, text, tags, difficulty, 0, options, new Date());
  }

  public static reconstitute(
    id: QuestionId,
    text: string,
    tags: string[],
    difficulty: string,
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

  public get difficulty(): string {
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
