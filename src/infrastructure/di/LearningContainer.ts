import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaCareerGoalRepository } from "@infrastructure/database/repositories/PrismaCareerGoalRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { PrismaResourceRepository } from "@infrastructure/database/repositories/PrismaResourceRepository";
import { GenkitRoleRecommender } from "@infrastructure/ai/flows/suggestRolesFlow";
import { GenkitRoadmapFlow } from "@infrastructure/ai/flows/generateRoadmapFlow";
import { PdfService } from "@infrastructure/services/PdfService";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { YouTubeService } from "@infrastructure/services/YouTubeService";
import { SetCareerGoal } from "@application/use-cases/learning/SetCareerGoal";
import { SuggestCareerRoles } from "@application/use-cases/learning/SuggestCareerRoles";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { GetUserRoadmap } from "@application/use-cases/learning/GetUserRoadmap";
import { UpdateRoadmapItemStatus } from "@application/use-cases/learning/UpdateRoadmapItemStatus";
import { GetItemResources } from "@application/use-cases/learning/GetItemResources";

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
  private resourceRepository: PrismaResourceRepository;
  private roleRecommender: GenkitRoleRecommender;
  private roadmapFlow: GenkitRoadmapFlow;
  private pdfService: PdfService;
  private gitHubService: GitHubService;
  private youtubeService: YouTubeService;

  constructor() {
    // Initialize infrastructure dependencies
    this.careerGoalRepository = new PrismaCareerGoalRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.resourceRepository = new PrismaResourceRepository(prisma);
    this.roleRecommender = new GenkitRoleRecommender();
    this.roadmapFlow = new GenkitRoadmapFlow();
    this.pdfService = new PdfService();
    this.gitHubService = new GitHubService();
    this.youtubeService = new YouTubeService();
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
    return new GenerateUserRoadmap(
      this.roadmapRepository,
      this.roadmapFlow,
      this.pdfService,
      this.gitHubService,
    );
  }

  /**
   * Returns an initialized GetUserRoadmap use case with all dependencies injected
   */
  getGetUserRoadmapUseCase(): GetUserRoadmap {
    return new GetUserRoadmap(this.roadmapRepository);
  }

  /**
   * Returns an initialized UpdateRoadmapItemStatus use case with all dependencies injected
   */
  getUpdateRoadmapItemStatusUseCase(): UpdateRoadmapItemStatus {
    return new UpdateRoadmapItemStatus(this.roadmapRepository);
  }

  /**
   * Returns an initialized GetItemResources use case with all dependencies injected
   */
  getGetItemResourcesUseCase(): GetItemResources {
    return new GetItemResources(this.resourceRepository, this.youtubeService);
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const learningContainer = new LearningContainer();

export { learningContainer };
