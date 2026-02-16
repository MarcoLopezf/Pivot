import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaCareerGoalRepository } from "@infrastructure/database/repositories/PrismaCareerGoalRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { PrismaResourceRepository } from "@infrastructure/database/repositories/PrismaResourceRepository";
import { PrismaJobRoleRepository } from "@infrastructure/database/repositories/PrismaJobRoleRepository";
import { GenkitRoleRecommender } from "@infrastructure/ai/flows/suggestRolesFlow";
import { GenkitRoadmapFlow } from "@infrastructure/ai/flows/generateRoadmapFlow";
import { GenkitProjectEnrichmentFlow } from "@infrastructure/ai/flows/enrichProjectFlow";
import { PrismaProjectDetailsRepository } from "@infrastructure/database/repositories/PrismaProjectDetailsRepository";
import { PdfService } from "@infrastructure/services/PdfService";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { YouTubeService } from "@infrastructure/services/YouTubeService";
import { SetCareerGoal } from "@application/use-cases/learning/SetCareerGoal";
import { SuggestCareerRoles } from "@application/use-cases/learning/SuggestCareerRoles";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { GetUserRoadmap } from "@application/use-cases/learning/GetUserRoadmap";
import { UpdateRoadmapItemStatus } from "@application/use-cases/learning/UpdateRoadmapItemStatus";
import { GetItemResources } from "@application/use-cases/learning/GetItemResources";
import { GetJobRoles } from "@application/use-cases/learning/GetJobRoles";
import { GetRoadmapById } from "@application/use-cases/learning/GetRoadmapById";
import { GetRoadmapItemById } from "@application/use-cases/learning/GetRoadmapItemById";
import { GetUserRoadmaps } from "@application/use-cases/learning/GetUserRoadmaps";
import { GetLastActiveRoadmap } from "@application/use-cases/learning/GetLastActiveRoadmap";
import { EnrichProjectDetails } from "@application/use-cases/learning/EnrichProjectDetails";

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
  private jobRoleRepository: PrismaJobRoleRepository;
  private roleRecommender: GenkitRoleRecommender;
  private roadmapFlow: GenkitRoadmapFlow;
  private projectEnrichmentFlow: GenkitProjectEnrichmentFlow;
  private projectDetailsRepository: PrismaProjectDetailsRepository;
  private pdfService: PdfService;
  private gitHubService: GitHubService;
  private youtubeService: YouTubeService;

  constructor() {
    // Initialize infrastructure dependencies
    this.careerGoalRepository = new PrismaCareerGoalRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.resourceRepository = new PrismaResourceRepository(prisma);
    this.jobRoleRepository = new PrismaJobRoleRepository(prisma);
    // Inject jobRoleRepository to ground AI suggestions to valid database roles
    this.roleRecommender = new GenkitRoleRecommender(this.jobRoleRepository);
    this.roadmapFlow = new GenkitRoadmapFlow();
    this.projectEnrichmentFlow = new GenkitProjectEnrichmentFlow();
    this.projectDetailsRepository = new PrismaProjectDetailsRepository(prisma);
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
   * Returns an initialized GetRoadmapById use case with all dependencies injected
   */
  getGetRoadmapByIdUseCase(): GetRoadmapById {
    return new GetRoadmapById(
      this.roadmapRepository,
      this.careerGoalRepository,
    );
  }

  /**
   * Returns an initialized GetRoadmapItemById use case with all dependencies injected
   */
  getGetRoadmapItemByIdUseCase(): GetRoadmapItemById {
    return new GetRoadmapItemById(this.roadmapRepository);
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

  /**
   * Returns an initialized GetUserRoadmaps use case with all dependencies injected
   */
  getGetUserRoadmapsUseCase(): GetUserRoadmaps {
    return new GetUserRoadmaps(
      this.roadmapRepository,
      this.careerGoalRepository,
    );
  }

  /**
   * Returns an initialized GetLastActiveRoadmap use case with all dependencies injected
   */
  getGetLastActiveRoadmapUseCase(): GetLastActiveRoadmap {
    return new GetLastActiveRoadmap(this.roadmapRepository);
  }

  /**
   * Returns the CareerGoalRepository instance
   * Used by other containers (e.g., OnboardingContainer) to access career goals
   */
  getCareerGoalRepository(): PrismaCareerGoalRepository {
    return this.careerGoalRepository;
  }

  /**
   * Returns the RoadmapRepository instance
   * Used by other containers to access roadmaps
   */
  getRoadmapRepository(): PrismaRoadmapRepository {
    return this.roadmapRepository;
  }

  /**
   * Returns the RoadmapFlow instance
   * Used by other containers to generate roadmaps
   */
  getRoadmapFlow(): GenkitRoadmapFlow {
    return this.roadmapFlow;
  }

  /**
   * Returns an initialized GetJobRoles use case with all dependencies injected
   */
  getGetJobRolesUseCase(): GetJobRoles {
    return new GetJobRoles(this.jobRoleRepository);
  }

  /**
   * Returns the JobRoleRepository instance
   * Used by other containers to access job roles
   */
  getJobRoleRepository(): PrismaJobRoleRepository {
    return this.jobRoleRepository;
  }

  /**
   * Returns an initialized EnrichProjectDetails use case with all dependencies injected
   */
  getEnrichProjectDetailsUseCase(): EnrichProjectDetails {
    return new EnrichProjectDetails(
      this.projectDetailsRepository,
      this.projectEnrichmentFlow,
    );
  }
}

// Singleton instance - reuse across requests to avoid multiple DB connections
const learningContainer = new LearningContainer();

export { learningContainer };
