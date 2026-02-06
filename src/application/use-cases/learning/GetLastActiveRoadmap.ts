import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * GetLastActiveRoadmap Use Case
 *
 * Returns the ID of the most recently updated roadmap for a user.
 * Used for smart redirect on the root page.
 *
 * Application Layer - Orchestrates domain logic without containing business rules
 */
export class GetLastActiveRoadmap {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(userId: string): Promise<string | null> {
    const userIdVO = UserId.create(userId);

    const roadmap = await this.roadmapRepository.findLatestByUserId(userIdVO);

    return roadmap?.id.value ?? null;
  }
}
