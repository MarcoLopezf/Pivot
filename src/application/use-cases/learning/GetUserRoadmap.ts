import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { UserId } from "@domain/profile/value-objects/UserId";

/**
 * GetUserRoadmap Use Case
 *
 * Application service that retrieves the user's most recent roadmap.
 * Returns null if no roadmap has been generated yet.
 */
export class GetUserRoadmap {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(userId: string): Promise<RoadmapDTO | null> {
    // Validate input
    const userIdValueObject = UserId.create(userId);

    // Fetch latest roadmap for user
    const roadmap =
      await this.roadmapRepository.findLatestByUserId(userIdValueObject);

    if (!roadmap) return null;

    // Map domain entity to DTO
    return {
      id: roadmap.id.value,
      goalId: roadmap.goalId.value,
      title: roadmap.title,
      progress: roadmap.progress,
      items: roadmap.items.map((item) => ({
        id: item.id.value,
        title: item.title,
        description: item.description,
        order: item.order,
        status: item.status,
      })),
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
    };
  }
}
