import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IGenerateRoadmapFlow } from "@domain/learning/services/IGenerateRoadmapFlow";
import { GenerateRoadmapDTO } from "@application/dtos/learning/GenerateRoadmapDTO";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { randomUUID } from "crypto";

/**
 * GenerateUserRoadmap Use Case
 *
 * Orchestrates the generation of a personalized learning roadmap.
 * Calls the AI flow to generate items, then persists the Roadmap aggregate.
 */
export class GenerateUserRoadmap {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly generateRoadmapFlow: IGenerateRoadmapFlow,
  ) {}

  async execute(dto: GenerateRoadmapDTO): Promise<RoadmapDTO> {
    const goalId = CareerGoalId.create(dto.goalId);
    const roadmapId = RoadmapId.create(randomUUID());

    const title = `Roadmap to ${dto.targetRole}`;
    const roadmap = Roadmap.create(roadmapId, goalId, title);

    const generatedItems = await this.generateRoadmapFlow.generate(
      dto.currentRole,
      dto.targetRole,
    );

    for (const generated of generatedItems) {
      const itemId = RoadmapItemId.create(randomUUID());
      const item = RoadmapItem.create(
        itemId,
        generated.title,
        generated.description,
        generated.order,
      );
      roadmap.addItem(item);
    }

    await this.roadmapRepository.save(roadmap);

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
