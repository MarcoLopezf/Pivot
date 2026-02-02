import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaQuestionRepository } from "@infrastructure/database/repositories/PrismaQuestionRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { PrismaQuizAttemptRepository } from "@infrastructure/database/repositories/PrismaQuizAttemptRepository";
import { PrismaProjectSubmissionRepository } from "@infrastructure/database/repositories/PrismaProjectSubmissionRepository";
import { GenkitQuestionsFlow } from "@infrastructure/ai/flows/generateQuestionsFlow";
import { analyzeProjectFlow } from "@infrastructure/ai/flows/analyzeProjectFlow";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { GenerateQuiz } from "@application/use-cases/assessment/GenerateQuiz";
import { SubmitQuiz } from "@application/use-cases/assessment/SubmitQuiz";
import { SubmitProject } from "@application/use-cases/assessment/SubmitProject";

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
  private githubService: GitHubService;

  constructor() {
    this.questionRepository = new PrismaQuestionRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.quizAttemptRepository = new PrismaQuizAttemptRepository(prisma);
    this.projectSubmissionRepository = new PrismaProjectSubmissionRepository(
      prisma,
    );
    this.questionsFlow = new GenkitQuestionsFlow();
    this.githubService = new GitHubService();
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

  getSubmitProjectUseCase(): SubmitProject {
    return new SubmitProject(
      this.projectSubmissionRepository,
      this.roadmapRepository,
      this.githubService,
      analyzeProjectFlow,
    );
  }
}

const assessmentContainer = new AssessmentContainer();
export { assessmentContainer };
