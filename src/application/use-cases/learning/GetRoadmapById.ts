import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";

export interface RoadmapOverviewDTO {
  roadmap: RoadmapDTO;
  targetRole: string;
  currentRole: string;
}

/**
 * GetRoadmapById Use Case
 *
 * Retrieves a specific roadmap by its ID with ownership verification.
 * Also fetches the associated career goal for context (target/current role).
 *
 * Application Layer - Orchestrates domain logic without containing business rules
 */
export class GetRoadmapById {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly careerGoalRepository: ICareerGoalRepository,
  ) {}

  async execute(
    roadmapId: string,
    userId: string,
  ): Promise<RoadmapOverviewDTO | null> {
    const roadmapIdVO = RoadmapId.create(roadmapId);
    const userIdVO = UserId.create(userId);

    // Verify ownership: Roadmap -> CareerGoal -> User
    const ownerUserId =
      await this.roadmapRepository.findOwnerUserId(roadmapIdVO);

    if (!ownerUserId || !ownerUserId.equals(userIdVO)) {
      return null;
    }

    // Fetch full roadmap with items
    const roadmap = await this.roadmapRepository.findById(roadmapIdVO);
    if (!roadmap) return null;

    // Fetch career goal for context
    const careerGoal = await this.careerGoalRepository.findById(
      CareerGoalId.create(roadmap.goalId.value),
    );

    // Map domain entity to DTO
    return {
      roadmap: {
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
          type: item.type,
          tags: item.tags,
          difficulty: item.difficulty,
          submissionUrl: item.submissionUrl,
        })),
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt,
      },
      targetRole: careerGoal?.targetRole ?? "",
      currentRole: careerGoal?.currentRole ?? "",
    };
  }
}
