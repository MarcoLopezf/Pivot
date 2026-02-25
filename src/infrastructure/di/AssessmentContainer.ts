import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaQuestionRepository } from "@infrastructure/database/repositories/PrismaQuestionRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { PrismaQuizAttemptRepository } from "@infrastructure/database/repositories/PrismaQuizAttemptRepository";
import { PrismaProjectSubmissionRepository } from "@infrastructure/database/repositories/PrismaProjectSubmissionRepository";
import { PrismaProjectDetailsRepository } from "@infrastructure/database/repositories/PrismaProjectDetailsRepository";
import { GenkitQuestionsFlow } from "@infrastructure/ai/flows/generateQuestionsFlow";
import { GenkitProjectAnalysisFlow } from "@infrastructure/ai/flows/analyzeProjectFlow";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { GenerateQuiz } from "@application/use-cases/assessment/GenerateQuiz";
import { SubmitQuiz } from "@application/use-cases/assessment/SubmitQuiz";
import { SubmitProject } from "@application/use-cases/assessment/SubmitProject";
import { GetQuizStatsForRoadmap } from "@application/use-cases/assessment/GetQuizStatsForRoadmap";

/**
 * AssessmentContainer - Dependency Injection Container for Assessment bounded context
 *
 * Wires up dependencies for quiz generation, assessment validation, and project submission.
 */
class AssessmentContainer {
  private questionRepository: PrismaQuestionRepository;
  private roadmapRepository: PrismaRoadmapRepository;
  private quizAttemptRepository: PrismaQuizAttemptRepository;
  private projectSubmissionRepository: PrismaProjectSubmissionRepository;
  private questionsFlow: GenkitQuestionsFlow;
  private projectAnalysisFlow: GenkitProjectAnalysisFlow;
  private githubService: GitHubService;
  private projectDetailsRepository: PrismaProjectDetailsRepository;

  constructor() {
    this.questionRepository = new PrismaQuestionRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.quizAttemptRepository = new PrismaQuizAttemptRepository(prisma);
    this.projectSubmissionRepository = new PrismaProjectSubmissionRepository(
      prisma,
    );
    this.questionsFlow = new GenkitQuestionsFlow();
    this.projectAnalysisFlow = new GenkitProjectAnalysisFlow();
    this.githubService = new GitHubService();
    this.projectDetailsRepository = new PrismaProjectDetailsRepository(prisma);
  }

  getGenerateQuizUseCase(): GenerateQuiz {
    return new GenerateQuiz(
      this.roadmapRepository,
      this.questionRepository,
      this.questionsFlow,
    );
  }

  getSubmitQuizUseCase(): SubmitQuiz {
    return new SubmitQuiz(
      this.questionRepository,
      this.quizAttemptRepository,
      this.roadmapRepository,
    );
  }

  getGetQuizStatsForRoadmapUseCase(): GetQuizStatsForRoadmap {
    return new GetQuizStatsForRoadmap(this.quizAttemptRepository);
  }

  getSubmitProjectUseCase(): SubmitProject {
    return new SubmitProject(
      this.projectSubmissionRepository,
      this.roadmapRepository,
      this.githubService,
      this.projectAnalysisFlow,
      this.projectDetailsRepository,
    );
  }
}

const assessmentContainer = new AssessmentContainer();
export { assessmentContainer };
