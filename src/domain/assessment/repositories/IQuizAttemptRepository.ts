import { QuizAttempt } from "@domain/assessment/entities/QuizAttempt";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export interface IQuizAttemptRepository {
  save(attempt: QuizAttempt): Promise<void>;
  findByRoadmapItemId(roadmapItemId: RoadmapItemId): Promise<QuizAttempt[]>;
  findByUserId(userId: UserId): Promise<QuizAttempt[]>;
}
