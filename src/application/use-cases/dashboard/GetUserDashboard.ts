import { DashboardDTO } from "@application/dtos/dashboard/DashboardDTO";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemDTO } from "@application/dtos/learning/RoadmapDTO";

/**
 * GetUserDashboard Use Case
 *
 * Aggregates User, CareerGoal, and Roadmap data to create a comprehensive
 * dashboard view. This use case orchestrates data from multiple repositories
 * across different bounded contexts (Profile and Learning).
 *
 * Application Layer - Orchestrates domain logic without containing business rules
 */
export class GetUserDashboard {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly careerGoalRepository: ICareerGoalRepository,
    private readonly roadmapRepository: IRoadmapRepository,
  ) {}

  /**
   * Executes the GetUserDashboard use case
   *
   * @param userId - The user ID to fetch dashboard data for
   * @returns DashboardDTO with aggregated data, or null if user not found
   * @throws Error if userId is empty or user not found
   */
  async execute(userId: string): Promise<DashboardDTO | null> {
    // Validate input
    if (!userId || userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    // 1. Fetch User
    const userIdVO = UserId.create(userId);
    const user = await this.userRepository.findById(userIdVO);

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Fetch Career Goal (get latest)
    const careerGoals = await this.careerGoalRepository.findByUserId(userIdVO);
    const latestGoal =
      careerGoals.length > 0
        ? careerGoals.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          )[0]
        : null;

    // 3. Fetch Roadmap
    const roadmap = await this.roadmapRepository.findLatestByUserId(userIdVO);

    // 4. Calculate progress and find next task
    let progress = 0;
    let totalTasks = 0;
    let completedTasks = 0;
    let nextTask: RoadmapItemDTO | null = null;

    if (roadmap) {
      const items = roadmap.items;
      totalTasks = items.length;
      completedTasks = items.filter(
        (item) => item.status === "completed",
      ).length;
      progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Find first PENDING or IN_PROGRESS item
      const nextItem = items.find((item) => item.status !== "completed");

      if (nextItem) {
        nextTask = {
          id: nextItem.id.value,
          title: nextItem.title,
          description: nextItem.description,
          order: nextItem.order,
          status: nextItem.status,
        };
      }
    }

    // 5. Return DTO
    return {
      userName: user.name,
      careerGoal: latestGoal ? latestGoal.targetRole : null,
      progress,
      totalTasks,
      completedTasks,
      nextTask,
    };
  }
}
