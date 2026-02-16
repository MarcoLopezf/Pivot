import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

/**
 * Data returned by the AI project enrichment flow
 */
export interface GeneratedProjectDetails {
  /** Specific, measurable criteria the student must fulfill (4-6 items) */
  acceptanceCriteria: string[];
  /** Technologies and tools relevant to the project (3-8 items) */
  technicalStack: string[];
  /** Key concepts the student should apply or research (3-5 items) */
  keyConcepts: string[];
}

/**
 * IProjectEnrichmentFlow
 *
 * Domain service interface for AI-powered project detail generation.
 * This is a port — implementations (adapters) live in the infrastructure layer.
 * Generates acceptance criteria, technical stack, and key concepts for project-type
 * roadmap items based on their title, description, tags, and difficulty.
 */
export interface IProjectEnrichmentFlow {
  /**
   * Enrich a project item with AI-generated details
   *
   * @param title - The project title
   * @param description - The project description/objective
   * @param tags - Technology tags associated with the project
   * @param difficulty - The difficulty level of the project
   * @returns Promise with generated project details
   */
  enrich(
    title: string,
    description: string,
    tags: string[],
    difficulty: DifficultyLevel,
  ): Promise<GeneratedProjectDetails>;
}
