import { QuestionOptionId } from "@domain/assessment/value-objects/QuestionOptionId";

export class QuestionOption {
  private readonly _id: QuestionOptionId;
  private readonly _text: string;
  private readonly _isCorrect: boolean;

  private constructor(id: QuestionOptionId, text: string, isCorrect: boolean) {
    this._id = id;
    this._text = text;
    this._isCorrect = isCorrect;
  }

  public static create(
    id: QuestionOptionId,
    text: string,
    isCorrect: boolean,
  ): QuestionOption {
    if (text.trim().length === 0) {
      throw new Error("QuestionOption text cannot be empty");
    }
    return new QuestionOption(id, text, isCorrect);
  }

  public static reconstitute(
    id: QuestionOptionId,
    text: string,
    isCorrect: boolean,
  ): QuestionOption {
    return new QuestionOption(id, text, isCorrect);
  }

  public get id(): QuestionOptionId {
    return this._id;
  }

  public get text(): string {
    return this._text;
  }

  public get isCorrect(): boolean {
    return this._isCorrect;
  }
}
