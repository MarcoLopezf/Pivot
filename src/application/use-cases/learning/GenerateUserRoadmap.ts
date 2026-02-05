import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IGenerateRoadmapFlow } from "@domain/learning/services/IGenerateRoadmapFlow";
import { GenerateRoadmapDTO } from "@application/dtos/learning/GenerateRoadmapDTO";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { TagNormalizer } from "@domain/shared/services/TagNormalizer";
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

    if (
      dto.experienceSummary ||
      dto.cvFile ||
      dto.cvText ||
      dto.githubUsername
    ) {
      const contextParts: string[] = [];

      // Add manual experience summary
      if (dto.experienceSummary) {
        contextParts.push(
          `EXPERIENCE SUMMARY:\n${dto.experienceSummary.trim()}`,
        );
      }

      // Add CV content (prioritize pre-extracted text from onboarding wizard)
      if (dto.cvText) {
        if (dto.cvText.trim()) {
          contextParts.push(`CV CONTENT:\n${dto.cvText.trim()}`);
        }
      } else if (dto.cvFile) {
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

      if (userContext) {
        contextParts.forEach((part, index) => {
          const firstLine = part.split("\n")[0];
          const partLength = part.length;
          console.log(`  ${index + 1}. ${firstLine} (${partLength} chars)`);
        });
      }
    }

    const generatedItems = await this.generateRoadmapFlow.generate(
      dto.currentRole,
      dto.targetRole,
      userContext,
    );

    // Create roadmap items with AI-determined status and normalized topics
    for (const generated of generatedItems) {
      const itemId = RoadmapItemId.create(randomUUID());
      // Normalize the topic tag to ensure atomic, canonical form
      const normalizedTopic = TagNormalizer.normalize(generated.topic);
      const item = RoadmapItem.reconstitute(
        itemId,
        generated.title,
        generated.description,
        generated.order,
        generated.status,
        generated.type,
        normalizedTopic || generated.topic, // Fallback to original if normalization fails
        generated.difficulty,
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
        type: item.type,
        topic: item.topic,
        difficulty: item.difficulty,
        submissionUrl: item.submissionUrl,
      })),
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt,
    };
  }
}
