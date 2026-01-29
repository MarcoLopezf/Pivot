import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaUserRepository } from "@infrastructure/database/repositories/PrismaUserRepository";
import { PrismaCareerGoalRepository } from "@infrastructure/database/repositories/PrismaCareerGoalRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { GetUserDashboard } from "@application/use-cases/dashboard/GetUserDashboard";

/**
 * DashboardContainer - Dependency Injection Container for Dashboard aggregation
 *
 * This container follows the Composition Root pattern, wiring up dependencies
 * for the Dashboard view. It aggregates data from multiple bounded contexts:
 * - Profile (User data)
 * - Learning (CareerGoal and Roadmap data)
 *
 * This ensures that:
 * - Database connections are reused (Prisma client singleton)
 * - Use cases are initialized once per container access
 * - Dependencies flow inward (Infrastructure -> Application -> Domain)
 */

class DashboardContainer {
  private userRepository: PrismaUserRepository;
  private careerGoalRepository: PrismaCareerGoalRepository;
  private roadmapRepository: PrismaRoadmapRepository;

  constructor() {
    // Initialize infrastructure dependencies
    this.userRepository = new PrismaUserRepository(prisma);
    this.careerGoalRepository = new PrismaCareerGoalRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
  }

  /**
   * Returns an initialized GetUserDashboard use case with all dependencies injected
   */
  getGetUserDashboardUseCase(): GetUserDashboard {
    return new GetUserDashboard(
      this.userRepository,
      this.careerGoalRepository,
      this.roadmapRepository,
    );
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const dashboardContainer = new DashboardContainer();

export { dashboardContainer };
