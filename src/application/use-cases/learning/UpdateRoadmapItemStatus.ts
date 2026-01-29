import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

export interface UpdateRoadmapItemStatusDTO {
  roadmapId: string;
  itemId: string;
  status: "pending" | "in_progress" | "completed";
}

/**
 * UpdateRoadmapItemStatus Use Case
 *
 * Application service that orchestrates updating a roadmap item's status.
 * Validates that the roadmap and item exist, updates the status via the domain entity,
 * persists the changes, and returns the updated roadmap DTO.
 */
export class UpdateRoadmapItemStatus {
  constructor(private readonly roadmapRepository: IRoadmapRepository) {}

  async execute(dto: UpdateRoadmapItemStatusDTO): Promise<RoadmapDTO> {
    // Find the roadmap
    const roadmapId = RoadmapId.create(dto.roadmapId);
    const roadmap = await this.roadmapRepository.findById(roadmapId);

    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    // Update item status (throws if item not found)
    const itemId = RoadmapItemId.create(dto.itemId);
    roadmap.updateItemStatus(itemId, dto.status);

    // Persist changes
    await this.roadmapRepository.save(roadmap);

    // Return updated DTO
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
