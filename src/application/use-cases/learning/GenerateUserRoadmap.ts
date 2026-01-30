import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IGenerateRoadmapFlow } from "@domain/learning/services/IGenerateRoadmapFlow";
import { GenerateRoadmapDTO } from "@application/dtos/learning/GenerateRoadmapDTO";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { PdfService } from "@infrastructure/services/PdfService";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { randomUUID } from "crypto";

/**
 * GenerateUserRoadmap Use Case
 *
 * Orchestrates the generation of a personalized learning roadmap.
 * Enhanced with user context analysis (CV + experience summary + GitHub) for intelligent
 * initial status assignment (completed/in_progress/pending).
 *
 * Calls the AI flow to generate items, then persists the Roadmap aggregate.
 */
export class GenerateUserRoadmap {
  constructor(
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly generateRoadmapFlow: IGenerateRoadmapFlow,
    private readonly pdfService: PdfService,
    private readonly gitHubService: GitHubService,
  ) {}

  async execute(dto: GenerateRoadmapDTO): Promise<RoadmapDTO> {
    const goalId = CareerGoalId.create(dto.goalId);
    const roadmapId = RoadmapId.create(randomUUID());

    const title = `Roadmap to ${dto.targetRole}`;
    const roadmap = Roadmap.create(roadmapId, goalId, title);

    // Build user context from experience summary, CV, and GitHub
    let userContext: string | undefined;

    if (dto.experienceSummary || dto.cvFile || dto.githubUsername) {
      const contextParts: string[] = [];

      // Add manual experience summary
      if (dto.experienceSummary) {
        contextParts.push(
          `EXPERIENCE SUMMARY:\n${dto.experienceSummary.trim()}`,
        );
      }

      // Extract and add CV text
      if (dto.cvFile) {
        try {
          const cvText = await this.pdfService.extractText(dto.cvFile);
          if (cvText.trim()) {
            contextParts.push(`CV CONTENT:\n${cvText.trim()}`);
          }
        } catch (error) {
          // Log but don't fail - continue without CV context
          console.error("Failed to extract CV text:", error);
        }
      }

      // Analyze GitHub profile
      if (dto.githubUsername) {
        try {
          const githubContext = await this.gitHubService.analyzeProfile(
            dto.githubUsername,
          );
          if (githubContext.trim()) {
            contextParts.push(githubContext.trim());
          }
        } catch (error) {
          // Log but don't fail - continue without GitHub context
          console.error("Failed to analyze GitHub profile:", error);
        }
      }

      userContext =
        contextParts.length > 0 ? contextParts.join("\n\n") : undefined;

      // Log the generated context for verification
      if (userContext) {
        console.log("=== AI Context for Roadmap Generation ===");
        console.log(userContext);
        console.log("=========================================");
      }
    }

    // Generate roadmap items with user context
    const generatedItems = await this.generateRoadmapFlow.generate(
      dto.currentRole,
      dto.targetRole,
      userContext,
    );

    // Create roadmap items with AI-determined status
    for (const generated of generatedItems) {
      const itemId = RoadmapItemId.create(randomUUID());
      const item = RoadmapItem.reconstitute(
        itemId,
        generated.title,
        generated.description,
        generated.order,
        generated.status, // Use status from AI
      );
      roadmap.addItem(item);
    }

    await this.roadmapRepository.save(roadmap);

    return {
      id: roadmap.id.value,
      goalId: roadmap.goalId.value,
      title: roadmap.title,
      progress: roadmap.progress,
      items: roadmap.items.map((item) => ({
        id: item.id.value,
        title: item.title,
        description: item.description,
        order: item.order,
        status: item.status,
      })),
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
    };
  }
}
