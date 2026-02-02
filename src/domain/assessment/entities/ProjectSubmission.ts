import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export type ProjectSubmissionStatus =
  | "pending"
  | "analyzing"
  | "completed"
  | "failed";

export class ProjectSubmission {
  private readonly _id: ProjectSubmissionId;
  private readonly _userId: UserId;
  private readonly _roadmapItemId: RoadmapItemId;
  private readonly _repoUrl: string;
  private _score: number | null;
  private _feedback: string | null;
  private _status: ProjectSubmissionStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: ProjectSubmissionId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    repoUrl: string,
    score: number | null,
    feedback: string | null,
    status: ProjectSubmissionStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._userId = userId;
    this._roadmapItemId = roadmapItemId;
    this._repoUrl = repoUrl;
    this._score = score;
    this._feedback = feedback;
    this._status = status;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new ProjectSubmission (initial state)
   */
  public static create(
    id: ProjectSubmissionId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    repoUrl: string,
  ): ProjectSubmission {
    if (!repoUrl || repoUrl.trim().length === 0) {
      throw new Error("ProjectSubmission repoUrl cannot be empty");
    }

    const now = new Date();
    return new ProjectSubmission(
      id,
      userId,
      roadmapItemId,
      repoUrl.trim(),
      null, // score initially null
      null, // feedback initially null
      "pending", // initial status
      now,
      now,
    );
  }

  /**
   * Reconstitute existing ProjectSubmission from database
   */
  public static reconstitute(
    id: ProjectSubmissionId,
    userId: UserId,
    roadmapItemId: RoadmapItemId,
    repoUrl: string,
    score: number | null,
    feedback: string | null,
    status: ProjectSubmissionStatus,
    createdAt: Date,
    updatedAt: Date,
  ): ProjectSubmission {
    return new ProjectSubmission(
      id,
      userId,
      roadmapItemId,
      repoUrl,
      score,
      feedback,
      status,
      createdAt,
      updatedAt,
    );
  }

  /**
   * Mark submission as analyzing (when GitHub fetch starts)
   */
  public markAsAnalyzing(): void {
    if (this._status !== "pending") {
      throw new Error(
        "Cannot mark as analyzing: submission is not in pending state",
      );
    }
    this._status = "analyzing";
    this._updatedAt = new Date();
  }

  /**
   * Complete analysis with results
   */
  public completeAnalysis(score: number, feedback: string): void {
    if (this._status !== "analyzing") {
      throw new Error(
        "Cannot complete analysis: submission is not in analyzing state",
      );
    }
    if (score < 0 || score > 100) {
      throw new Error("ProjectSubmission score must be between 0 and 100");
    }
    if (!feedback || feedback.trim().length === 0) {
      throw new Error("ProjectSubmission feedback cannot be empty");
    }

    this._score = score;
    this._feedback = feedback.trim();
    this._status = "completed";
    this._updatedAt = new Date();
  }

  /**
   * Mark submission as failed (e.g., invalid repo, API error)
   */
  public markAsFailed(feedback: string): void {
    if (!feedback || feedback.trim().length === 0) {
      throw new Error("Failure feedback cannot be empty");
    }

    this._feedback = feedback.trim();
    this._status = "failed";
    this._updatedAt = new Date();
  }

  // Getters
  public get id(): ProjectSubmissionId {
    return this._id;
  }

  public get userId(): UserId {
    return this._userId;
  }

  public get roadmapItemId(): RoadmapItemId {
    return this._roadmapItemId;
  }

  public get repoUrl(): string {
    return this._repoUrl;
  }

  public get score(): number | null {
    return this._score;
  }

  public get feedback(): string | null {
    return this._feedback;
  }

  public get status(): ProjectSubmissionStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
