import {
  IProjectDetailsRepository,
  ProjectDetailsData,
} from "@domain/learning/repositories/IProjectDetailsRepository";
import { IProjectEnrichmentFlow } from "@domain/learning/services/IProjectEnrichmentFlow";
import { DifficultyLevel } from "@domain/shared/enums/DifficultyLevel";

export interface EnrichProjectInput {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
}

/**
 * EnrichProjectDetails Use Case
 *
 * Lazily generates and persists AI-powered project details (acceptance criteria,
 * technical stack, key concepts) for project-type roadmap items.
 * If details already exist, returns the cached version.
 *
 * Application Layer — Orchestrates domain logic without containing business rules
 */
export class EnrichProjectDetails {
  constructor(
    private readonly projectDetailsRepo: IProjectDetailsRepository,
    private readonly enrichmentFlow: IProjectEnrichmentFlow,
  ) {}

  async execute(item: EnrichProjectInput): Promise<ProjectDetailsData> {
    // 1. Check if already enriched (cache hit)
    const existing = await this.projectDetailsRepo.findByRoadmapItemId(item.id);
    if (existing) return existing;

    // 2. Generate with AI
    const generated = await this.enrichmentFlow.enrich(
      item.title,
      item.description,
      item.tags,
      item.difficulty as DifficultyLevel,
    );

    // 3. Persist and return
    return await this.projectDetailsRepo.save(item.id, generated);
  }
}
