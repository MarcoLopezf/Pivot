import { type IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { type ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { type IGenerateRoadmapFlow } from "@domain/learning/services/IGenerateRoadmapFlow";
import { type IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { prisma } from "@infrastructure/database/PrismaClient";
import { randomUUID } from "crypto";

/**
 * CompleteOnboarding Use Case
 *
 * Finalizes the onboarding process by:
 * 1. Migrating onboarding data to user profile
 * 2. Creating a career goal
 * 3. Generating a personalized roadmap
 * 4. Marking onboarding as complete
 * 5. Cleaning up onboarding progress
 *
 * @layer Application
 */
export class CompleteOnboarding {
  constructor(
    private readonly onboardingRepository: IOnboardingRepository,
    private readonly careerGoalRepository: ICareerGoalRepository,
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly generateRoadmapFlow: IGenerateRoadmapFlow,
  ) {}

  /**
   * Execute the use case
   *
   * @param userId - The user's unique identifier
   * @returns Promise that resolves when onboarding is complete
   */
  async execute(userId: string): Promise<void> {
    // 1. Retrieve onboarding session
    const session = await this.onboardingRepository.findByUserId(userId);

    if (!session) {
      throw new Error("Onboarding session not found");
    }

    const data = session.data;

    // 2. Extract profile data from onboarding session
    const yearsExperience = (data.yearsExperience as number) || 0;
    const profileData = {
      location: (data.region as string) || null,
      isEntryLevel: yearsExperience === 0,
      yearsExperience: yearsExperience,
      currentSeniority: this.determineSeniority(yearsExperience),
    };

    // 3. Update user profile with onboarding data
    await prisma.user.update({
      where: { id: userId },
      data: {
        location: profileData.location,
        isEntryLevel: profileData.isEntryLevel,
        yearsExperience: profileData.yearsExperience,
        currentSeniority: profileData.currentSeniority,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    // 4. Create career goal
    const targetRole = (data.targetRole as string) || "Software Developer";
    const currentRole = (data.currentRole as string) || "Beginner";

    const careerGoal = CareerGoal.create(
      CareerGoalId.create(randomUUID()),
      UserId.create(userId),
      targetRole,
      currentRole,
    );

    await this.careerGoalRepository.save(careerGoal);

    // 5. Generate roadmap using AI
    const experienceSummary = this.buildExperienceSummary(data);

    const generatedItems = await this.generateRoadmapFlow.generate(
      currentRole,
      targetRole,
      experienceSummary,
    );

    // 6. Create roadmap entity from generated items
    const roadmap = Roadmap.create(
      RoadmapId.create(randomUUID()),
      careerGoal.id,
      `Learning Path: ${currentRole} → ${targetRole}`,
    );

    // Add each generated item to the roadmap
    for (const generatedItem of generatedItems) {
      const roadmapItem = RoadmapItem.create(
        RoadmapItemId.create(randomUUID()),
        generatedItem.title,
        generatedItem.description,
        generatedItem.order,
        {
          type: generatedItem.type,
          topic: generatedItem.topic,
          difficulty: generatedItem.difficulty,
        },
      );

      // Set the status based on AI analysis
      if (generatedItem.status === "completed") {
        roadmapItem.markCompleted();
      } else if (generatedItem.status === "in_progress") {
        roadmapItem.markInProgress();
      }

      roadmap.addItem(roadmapItem);
    }

    // Save the generated roadmap
    await this.roadmapRepository.save(roadmap);

    // 7. Clean up onboarding session
    await this.onboardingRepository.delete(userId);
  }

  /**
   * Determines seniority level based on years of experience
   */
  private determineSeniority(yearsExperience: number): string {
    if (yearsExperience === 0) return "Entry Level";
    if (yearsExperience < 2) return "Junior";
    if (yearsExperience < 5) return "Mid-Level";
    if (yearsExperience < 8) return "Senior";
    return "Lead/Staff";
  }

  /**
   * Builds an experience summary from onboarding data
   */
  private buildExperienceSummary(data: Record<string, unknown>): string {
    const parts: string[] = [];

    if (data.currentRole) {
      parts.push(`Current role: ${data.currentRole}`);
    }

    if (data.yearsExperience !== undefined) {
      const years = data.yearsExperience as number;
      if (years === 0) {
        parts.push("Just starting out in tech");
      } else {
        parts.push(`${years} years of experience`);
      }
    }

    if (data.interests) {
      parts.push(`Interests: ${data.interests}`);
    }

    if (data.dislike) {
      parts.push(`Prefers to avoid: ${data.dislike}`);
    }

    return parts.join(". ");
  }
}
