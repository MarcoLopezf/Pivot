import { IProjectSubmissionRepository } from "@domain/assessment/repositories/IProjectSubmissionRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { IProjectDetailsRepository } from "@domain/learning/repositories/IProjectDetailsRepository";
import { GitHubService } from "@infrastructure/services/GitHubService";
import { ProjectSubmission } from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import {
  SubmitProjectInputDTO,
  ProjectResultDTO,
} from "@application/dtos/assessment/SubmitProjectDTO";
import { randomUUID } from "crypto";
import { z } from "zod";

const PASSING_THRESHOLD = 70;

// Validation schema for GitHub repository URLs (SSRF protection)
const githubRepoUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        if (parsed.protocol !== "https:") return false;
        if (hostname !== "github.com") return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid GitHub repository URL" },
  );

/**
 * AI Flow Input/Output Types
 */
interface AnalyzeProjectInput {
  repoUrl: string;
  files: Array<{ path: string; content: string }>;
  topic: string;
  description: string;
  expectedSkills: string;
  acceptanceCriteria?: string[];
  technicalStack?: string[];
}

interface AnalyzeProjectOutput {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * SubmitProject Use Case
 *
 * Validates and analyzes a GitHub project submission for a roadmap item.
 *
 * Flow:
 * 1. Validate input (URL format, roadmap exists, item exists)
 * 2. CRITICAL: Verify RoadmapItem.type === 'project'
 * 3. Fetch repository code from GitHub (smart fetch)
 * 4. Analyze project using AI flow
 * 5. Save submission to database
 * 6. If passed (≥70%), mark roadmap item as completed
 *
 * Security:
 * - Validates GitHub URLs to prevent SSRF
 * - Uses GitHubService which has file size and count limits
 */
export class SubmitProject {
  constructor(
    private readonly projectSubmissionRepository: IProjectSubmissionRepository,
    private readonly roadmapRepository: IRoadmapRepository,
    private readonly githubService: GitHubService,
    private readonly analyzeProjectFlow: (
      input: AnalyzeProjectInput,
    ) => Promise<AnalyzeProjectOutput>,
    private readonly projectDetailsRepository?: IProjectDetailsRepository,
  ) {}

  async execute(input: SubmitProjectInputDTO): Promise<ProjectResultDTO> {
    const { roadmapId, roadmapItemId, repoUrl } = input;

    // 1. Validate GitHub URL (SSRF protection)
    const urlValidation = githubRepoUrlSchema.safeParse(repoUrl);
    if (!urlValidation.success) {
      throw new Error("Invalid GitHub repository URL");
    }

    // 2. Get roadmap and verify it exists
    const roadmapIdVO = RoadmapId.create(roadmapId);
    const roadmap = await this.roadmapRepository.findById(roadmapIdVO);

    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    // 3. Find the roadmap item
    const roadmapItemIdVO = RoadmapItemId.create(roadmapItemId);
    const roadmapItem = roadmap.items.find((item) =>
      item.id.equals(roadmapItemIdVO),
    );

    if (!roadmapItem) {
      throw new Error("Roadmap item not found");
    }

    // 4. CRITICAL: Verify item type is PROJECT
    if (roadmapItem.type !== "project") {
      throw new Error(
        "This roadmap item is not a PROJECT. Only project-type items can be validated with code.",
      );
    }

    // 5. Verify authenticated user owns this roadmap
    const userId = await this.roadmapRepository.findOwnerUserId(roadmapIdVO);
    if (!userId) {
      throw new Error("Roadmap has no owner");
    }
    if (userId.value !== input.userId) {
      throw new Error(
        "AUTHORIZATION_ERROR: Not authorized to submit project for this roadmap",
      );
    }

    // 6. Create initial submission entity
    const submissionId = ProjectSubmissionId.create(randomUUID());
    const submission = ProjectSubmission.create(
      submissionId,
      userId,
      roadmapItemIdVO,
      repoUrl,
    );

    // 7. Mark as analyzing and save
    submission.markAsAnalyzing();
    await this.projectSubmissionRepository.save(submission);

    try {
      // 8. Fetch repository code from GitHub
      const repoData = await this.githubService.analyzeRepository(repoUrl);

      // 9. Fetch project details (acceptance criteria & tech stack) if available
      let acceptanceCriteria: string[] | undefined;
      let technicalStack: string[] | undefined;
      if (this.projectDetailsRepository) {
        try {
          const projectDetails =
            await this.projectDetailsRepository.findByRoadmapItemId(
              roadmapItemId,
            );
          if (projectDetails) {
            acceptanceCriteria = projectDetails.acceptanceCriteria;
            technicalStack = projectDetails.technicalStack;
          }
        } catch {
          // Project details are non-critical; continue without them
        }
      }

      // 10. Analyze project using AI
      const aiResult = await this.analyzeProjectFlow({
        repoUrl,
        files: repoData.files,
        topic: roadmapItem.title,
        description: roadmapItem.description,
        expectedSkills:
          roadmapItem.tags.length > 0
            ? roadmapItem.tags.join(", ")
            : roadmapItem.description,
        acceptanceCriteria,
        technicalStack,
      });

      // 10. Complete analysis with results
      submission.completeAnalysis(aiResult.score, aiResult.feedback);
      await this.projectSubmissionRepository.save(submission);

      // 11. If passed, mark roadmap item as completed
      const passed = aiResult.score >= PASSING_THRESHOLD;
      if (passed) {
        roadmap.updateItemStatus(roadmapItemIdVO, "completed");
        await this.roadmapRepository.save(roadmap);
      }

      return {
        submissionId: submissionId.value,
        score: aiResult.score,
        passed,
        feedback: aiResult.feedback,
        strengths: aiResult.strengths,
        improvements: aiResult.improvements,
      };
    } catch (error) {
      // Mark submission as failed
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      submission.markAsFailed(`Failed to analyze project: ${errorMessage}`);
      await this.projectSubmissionRepository.save(submission);

      // Re-throw the original error
      throw error;
    }
  }
}
