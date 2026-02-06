import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { UserId } from "@domain/profile/value-objects/UserId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

export interface RoadmapListItemDTO {
  id: string;
  title: string;
  role: string;
}

/**
 * GetUserRoadmaps Use Case
 *
 * Returns a lightweight list of all roadmaps for a user.
 * Each item includes the roadmap id, title, and target role
 * from the associated career goal. Sorted by updatedAt desc.
 *
 * Application Layer - Orchestrates domain logic without containing business rules
 */
export class GetUserRoadmaps {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly careerGoalRepository: ICareerGoalRepository,
  ) {}

  async execute(userId: string): Promise<RoadmapListItemDTO[]> {
    const userIdVO = UserId.create(userId);

    const roadmaps = await this.roadmapRepository.findAllByUserId(userIdVO);

    // Resolve target roles from career goals
    const results: RoadmapListItemDTO[] = [];

    for (const roadmap of roadmaps) {
      const goal = await this.careerGoalRepository.findById(
        CareerGoalId.create(roadmap.goalId.value),
      );

      results.push({
        id: roadmap.id.value,
        title: roadmap.title,
        role: goal?.targetRole ?? "",
      });
    }

    return results;
  }
}
