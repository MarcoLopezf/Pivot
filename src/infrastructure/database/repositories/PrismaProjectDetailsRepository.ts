import { type PrismaClient } from "@prisma/client";
import {
  IProjectDetailsRepository,
  ProjectDetailsData,
} from "@domain/learning/repositories/IProjectDetailsRepository";
import type { GeneratedProjectDetails } from "@domain/learning/services/IProjectEnrichmentFlow";

/**
 * PrismaProjectDetailsRepository
 *
 * Infrastructure adapter that implements IProjectDetailsRepository using Prisma.
 * Handles persistence for AI-generated project details independently from
 * the Roadmap aggregate to support lazy enrichment.
 */
export class PrismaProjectDetailsRepository implements IProjectDetailsRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByRoadmapItemId(
    roadmapItemId: string,
  ): Promise<ProjectDetailsData | null> {
    const record = await this.db.projectDetails.findUnique({
      where: { roadmapItemId },
    });

    if (!record) return null;

    return {
      id: record.id,
      roadmapItemId: record.roadmapItemId,
      acceptanceCriteria: record.acceptanceCriteria,
      technicalStack: record.technicalStack,
      keyConcepts: record.keyConcepts,
      generatedAt: record.generatedAt,
    };
  }

  async save(
    roadmapItemId: string,
    details: GeneratedProjectDetails,
  ): Promise<ProjectDetailsData> {
    const record = await this.db.projectDetails.upsert({
      where: { roadmapItemId },
      create: {
        roadmapItemId,
        acceptanceCriteria: details.acceptanceCriteria,
        technicalStack: details.technicalStack,
        keyConcepts: details.keyConcepts,
      },
      update: {
        acceptanceCriteria: details.acceptanceCriteria,
        technicalStack: details.technicalStack,
        keyConcepts: details.keyConcepts,
      },
    });

    return {
      id: record.id,
      roadmapItemId: record.roadmapItemId,
      acceptanceCriteria: record.acceptanceCriteria,
      technicalStack: record.technicalStack,
      keyConcepts: record.keyConcepts,
      generatedAt: record.generatedAt,
    };
  }
}
