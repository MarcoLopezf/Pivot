import { type PrismaClient, ProjectSubmissionStatus } from "@prisma/client";
import { IProjectSubmissionRepository } from "@domain/assessment/repositories/IProjectSubmissionRepository";
import { ProjectSubmission } from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { ProjectSubmissionMapper } from "@infrastructure/database/mappers/ProjectSubmissionMapper";

export class PrismaProjectSubmissionRepository implements IProjectSubmissionRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(submission: ProjectSubmission): Promise<void> {
    const data = ProjectSubmissionMapper.toPersistence(submission);

    await this.db.projectSubmission.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        userId: data.userId,
        roadmapItemId: data.roadmapItemId,
        repoUrl: data.repoUrl,
        score: data.score,
        feedback: data.feedback,
        status: data.status as ProjectSubmissionStatus,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      update: {
        score: data.score,
        feedback: data.feedback,
        status: data.status as ProjectSubmissionStatus,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: ProjectSubmissionId): Promise<ProjectSubmission | null> {
    const prismaSubmission = await this.db.projectSubmission.findUnique({
      where: { id: id.value },
    });

    if (!prismaSubmission) {
      return null;
    }

    return ProjectSubmissionMapper.toDomain(prismaSubmission);
  }

  async findByRoadmapItemId(
    roadmapItemId: RoadmapItemId,
  ): Promise<ProjectSubmission[]> {
    const prismaSubmissions = await this.db.projectSubmission.findMany({
      where: { roadmapItemId: roadmapItemId.value },
      orderBy: { createdAt: "desc" },
    });

    return prismaSubmissions.map((s) => ProjectSubmissionMapper.toDomain(s));
  }
}
