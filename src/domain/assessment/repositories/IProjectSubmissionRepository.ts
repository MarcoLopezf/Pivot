import { ProjectSubmission } from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export interface IProjectSubmissionRepository {
  save(submission: ProjectSubmission): Promise<void>;
  findById(id: ProjectSubmissionId): Promise<ProjectSubmission | null>;
  findByRoadmapItemId(
    roadmapItemId: RoadmapItemId,
  ): Promise<ProjectSubmission[]>;
}
