import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaCareerGoalRepository } from "@infrastructure/database/repositories/PrismaCareerGoalRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { GenkitRoleRecommender } from "@infrastructure/ai/flows/suggestRolesFlow";
import { GenkitRoadmapFlow } from "@infrastructure/ai/flows/generateRoadmapFlow";
import { SetCareerGoal } from "@application/use-cases/learning/SetCareerGoal";
import { SuggestCareerRoles } from "@application/use-cases/learning/SuggestCareerRoles";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";

/**
 * LearningContainer - Dependency Injection Container for Learning bounded context
 *
 * This container follows the Composition Root pattern, wiring up dependencies
 * for the Learning domain. It ensures that:
 * - Database connections are reused (Prisma client singleton)
 * - AI services are initialized once
 * - Use cases are initialized once per container access
 * - Dependencies flow inward (Infrastructure -> Application -> Domain)
 */

class LearningContainer {
  private careerGoalRepository: PrismaCareerGoalRepository;
  private roadmapRepository: PrismaRoadmapRepository;
  private roleRecommender: GenkitRoleRecommender;
  private roadmapFlow: GenkitRoadmapFlow;

  constructor() {
    // Initialize infrastructure dependencies
    this.careerGoalRepository = new PrismaCareerGoalRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.roleRecommender = new GenkitRoleRecommender();
    this.roadmapFlow = new GenkitRoadmapFlow();
  }

  /**
   * Returns an initialized SetCareerGoal use case with all dependencies injected
   */
  getSetCareerGoalUseCase(): SetCareerGoal {
    return new SetCareerGoal(this.careerGoalRepository);
  }

  /**
   * Returns an initialized SuggestCareerRoles use case with all dependencies injected
   */
  getSuggestCareerRolesUseCase(): SuggestCareerRoles {
    return new SuggestCareerRoles(this.roleRecommender);
  }

  /**
   * Returns an initialized GenerateUserRoadmap use case with all dependencies injected
   */
  getGenerateUserRoadmapUseCase(): GenerateUserRoadmap {
    return new GenerateUserRoadmap(this.roadmapRepository, this.roadmapFlow);
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const learningContainer = new LearningContainer();

export { learningContainer };
