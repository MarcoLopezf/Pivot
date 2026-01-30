import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaQuestionRepository } from "@infrastructure/database/repositories/PrismaQuestionRepository";
import { PrismaRoadmapRepository } from "@infrastructure/database/repositories/PrismaRoadmapRepository";
import { GenkitQuestionsFlow } from "@infrastructure/ai/flows/generateQuestionsFlow";
import { GenerateQuiz } from "@application/use-cases/assessment/GenerateQuiz";

/**
 * AssessmentContainer - Dependency Injection Container for Assessment bounded context
 *
 * Wires up dependencies for quiz generation and assessment validation.
 */
class AssessmentContainer {
  private questionRepository: PrismaQuestionRepository;
  private roadmapRepository: PrismaRoadmapRepository;
  private questionsFlow: GenkitQuestionsFlow;

  constructor() {
    this.questionRepository = new PrismaQuestionRepository(prisma);
    this.roadmapRepository = new PrismaRoadmapRepository(prisma);
    this.questionsFlow = new GenkitQuestionsFlow();
  }

  getGenerateQuizUseCase(): GenerateQuiz {
    return new GenerateQuiz(
      this.roadmapRepository,
      this.questionRepository,
      this.questionsFlow,
    );
  }
}

const assessmentContainer = new AssessmentContainer();
export { assessmentContainer };
