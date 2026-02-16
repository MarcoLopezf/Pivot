import type { GeneratedProjectDetails } from "@domain/learning/services/IProjectEnrichmentFlow";

/**
 * Persisted project details data
 */
export interface ProjectDetailsData {
  id: string;
  roadmapItemId: string;
  acceptanceCriteria: string[];
  technicalStack: string[];
  keyConcepts: string[];
  generatedAt: Date;
}

/**
 * IProjectDetailsRepository
 *
 * Repository interface (port) for ProjectDetails.
 * Manages persistence of AI-generated project enrichment data
 * independently from the Roadmap aggregate.
 */
export interface IProjectDetailsRepository {
  /**
   * Find project details by roadmap item ID
   */
  findByRoadmapItemId(
    roadmapItemId: string,
  ): Promise<ProjectDetailsData | null>;

  /**
   * Save (create or update) project details for a roadmap item
   */
  save(
    roadmapItemId: string,
    details: GeneratedProjectDetails,
  ): Promise<ProjectDetailsData>;
}
