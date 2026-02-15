import { QuizAttemptId } from "@domain/assessment/value-objects/QuizAttemptId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

const PASSING_THRESHOLD = 70;

export class QuizAttempt {
  private readonly _id: QuizAttemptId;
  private readonly _userId: UserId;
  private readonly _roadmapItemId: RoadmapItemId;
  private readonly _score: number;
  private readonly _passed: boolean;
  private readonly _createdAt: Date;

  private constructor(
    id: QuizAttemptId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    score: number,
    passed: boolean,
    createdAt: Date,
  ) {
    this._id = id;
    this._userId = userId;
    this._roadmapItemId = roadmapItemId;
    this._score = score;
    this._passed = passed;
    this._createdAt = createdAt;
  }

  public static create(
    id: QuizAttemptId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    score: number,
  ): QuizAttempt {
    if (score < 0 || score > 100) {
      throw new Error("QuizAttempt score must be between 0 and 100");
    }
    const passed = score >= PASSING_THRESHOLD;
    return new QuizAttempt(
      id,
      userId,
      roadmapItemId,
      score,
      passed,
      new Date(),
    );
  }

  public static reconstitute(
    id: QuizAttemptId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    score: number,
    passed: boolean,
    createdAt: Date,
  ): QuizAttempt {
    return new QuizAttempt(id, userId, roadmapItemId, score, passed, createdAt);
  }

  public get id(): QuizAttemptId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get roadmapItemId(): RoadmapItemId {
    return this._roadmapItemId;
  }

  public get score(): number {
    return this._score;
  }

  public get passed(): boolean {
    return this._passed;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }
}
