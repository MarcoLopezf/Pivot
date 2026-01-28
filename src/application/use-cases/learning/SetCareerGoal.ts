import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { SetCareerGoalDTO } from "@application/dtos/learning/SetCareerGoalDTO";
import { CareerGoalDTO } from "@application/dtos/learning/CareerGoalDTO";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { randomUUID } from "crypto";

/**
 * SetCareerGoal Use Case
 *
 * Application service that orchestrates the process of setting a user's career goal.
 * Validates input, creates the CareerGoal entity, and persists it via the repository.
 */
export class SetCareerGoal {
  constructor(private readonly careerGoalRepository: ICareerGoalRepository) {}

  async execute(dto: SetCareerGoalDTO): Promise<CareerGoalDTO> {
    // Create value objects
    const id = CareerGoalId.create(randomUUID());
    const userId = UserId.create(dto.userId);

    // Create domain entity (business validation happens here)
    const careerGoal = CareerGoal.create(
      id,
      userId,
      dto.targetRole,
      dto.currentRole,
    );

    // Persist via repository
    await this.careerGoalRepository.save(careerGoal);

    // Return DTO
    return {
      id: careerGoal.id.value,
      userId: careerGoal.userId.value,
      targetRole: careerGoal.targetRole,
      currentRole: careerGoal.currentRole,
      createdAt: careerGoal.createdAt,
      updatedAt: careerGoal.updatedAt,
    };
  }
}
