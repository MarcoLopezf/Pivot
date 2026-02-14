import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { RoadmapItemDTO } from "@application/dtos/learning/RoadmapDTO";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { UserId } from "@domain/profile/value-objects/UserId";

export interface RoadmapItemDetailDTO {
  item: RoadmapItemDTO;
  roadmapId: string;
  roadmapTitle: string;
  totalItems: number;
}

/**
 * GetRoadmapItemById Use Case
 *
 * Retrieves a single roadmap item with ownership verification.
 * Verifies the roadmap belongs to the user before returning the item.
 *
 * Application Layer - Orchestrates domain logic without containing business rules
 */
export class GetRoadmapItemById {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(
    roadmapId: string,
    itemId: string,
    userId: string,
  ): Promise<RoadmapItemDetailDTO | null> {
    const roadmapIdVO = RoadmapId.create(roadmapId);
    const userIdVO = UserId.create(userId);

    // Verify ownership: Roadmap -> CareerGoal -> User
    const ownerUserId =
      await this.roadmapRepository.findOwnerUserId(roadmapIdVO);

    if (!ownerUserId || !ownerUserId.equals(userIdVO)) {
      return null;
    }

    // Fetch full roadmap to find the specific item
    const roadmap = await this.roadmapRepository.findById(roadmapIdVO);
    if (!roadmap) return null;

    // Find the specific item
    const item = roadmap.items.find((i) => i.id.value === itemId);
    if (!item) return null;

    return {
      item: {
        id: item.id.value,
        title: item.title,
        description: item.description,
        order: item.order,
        status: item.status,
        type: item.type,
        tags: item.tags,
        difficulty: item.difficulty,
        submissionUrl: item.submissionUrl,
      },
      roadmapId: roadmap.id.value,
      roadmapTitle: roadmap.title,
      totalItems: roadmap.items.length,
    };
  }
}
