import { type ProjectSubmission as PrismaProjectSubmission } from "@prisma/client";
import { ProjectSubmission } from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import type { ProjectSubmissionStatus } from "@domain/assessment/entities/ProjectSubmission";

/**
 * Maps Prisma status to domain status
 */
function mapPrismaStatusToDomain(
  prismaStatus: string,
): ProjectSubmissionStatus {
  const statusMap: Record<string, ProjectSubmissionStatus> = {
    PENDING: "pending",
    ANALYZING: "analyzing",
    COMPLETED: "completed",
    FAILED: "failed",
  };
  return statusMap[prismaStatus] || "pending";
}

/**
 * Maps domain status to Prisma status
 */
function mapDomainStatusToPrisma(
  domainStatus: ProjectSubmissionStatus,
): string {
  const statusMap: Record<ProjectSubmissionStatus, string> = {
    pending: "PENDING",
    analyzing: "ANALYZING",
    completed: "COMPLETED",
    failed: "FAILED",
  };
  return statusMap[domainStatus];
}

export class ProjectSubmissionMapper {
  static toDomain(
    prismaSubmission: PrismaProjectSubmission,
  ): ProjectSubmission {
    return ProjectSubmission.reconstitute(
      ProjectSubmissionId.create(prismaSubmission.id),
      UserId.create(prismaSubmission.userId),
      RoadmapItemId.create(prismaSubmission.roadmapItemId),
      prismaSubmission.repoUrl,
      prismaSubmission.score,
      prismaSubmission.feedback,
      mapPrismaStatusToDomain(prismaSubmission.status),
      prismaSubmission.createdAt,
      prismaSubmission.updatedAt,
    );
  }

  static toPersistence(submission: ProjectSubmission): {
    id: string;
    userId: string;
    roadmapItemId: string;
    repoUrl: string;
    score: number | null;
    feedback: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: submission.id.value,
      userId: submission.userId.value,
      roadmapItemId: submission.roadmapItemId.value,
      repoUrl: submission.repoUrl,
      score: submission.score,
      feedback: submission.feedback,
      status: mapDomainStatusToPrisma(submission.status),
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    };
  }
}
