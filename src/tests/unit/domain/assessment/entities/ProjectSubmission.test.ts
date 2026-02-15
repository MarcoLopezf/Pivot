import { describe, it, expect } from "vitest";
import {
  ProjectSubmission,
  ProjectSubmissionStatus,
} from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

describe("ProjectSubmission", () => {
  const makeSubmission = (): ProjectSubmission =>
    ProjectSubmission.create(
      ProjectSubmissionId.create("sub-1"),
      UserId.create("user-1"),
      RoadmapItemId.create("item-1"),
      "https://github.com/user/repo",
    );

  describe("create", () => {
    it("should create with pending status and null score/feedback", () => {
      const sub = makeSubmission();

      expect(sub.id.value).toBe("sub-1");
      expect(sub.userId.value).toBe("user-1");
      expect(sub.roadmapItemId.value).toBe("item-1");
      expect(sub.repoUrl).toBe("https://github.com/user/repo");
      expect(sub.status).toBe(ProjectSubmissionStatus.Pending);
      expect(sub.score).toBeNull();
      expect(sub.feedback).toBeNull();
      expect(sub.createdAt).toBeInstanceOf(Date);
      expect(sub.updatedAt).toBeInstanceOf(Date);
    });

    it("should trim the repoUrl", () => {
      const sub = ProjectSubmission.create(
        ProjectSubmissionId.create("sub-1"),
        UserId.create("user-1"),
        RoadmapItemId.create("item-1"),
        "  https://github.com/user/repo  ",
      );

      expect(sub.repoUrl).toBe("https://github.com/user/repo");
    });

    it("should reject empty repoUrl", () => {
      expect(() =>
        ProjectSubmission.create(
          ProjectSubmissionId.create("sub-1"),
          UserId.create("user-1"),
          RoadmapItemId.create("item-1"),
          "",
        ),
      ).toThrow("ProjectSubmission repoUrl cannot be empty");
    });

    it("should reject whitespace-only repoUrl", () => {
      expect(() =>
        ProjectSubmission.create(
          ProjectSubmissionId.create("sub-1"),
          UserId.create("user-1"),
          RoadmapItemId.create("item-1"),
          "   ",
        ),
      ).toThrow("ProjectSubmission repoUrl cannot be empty");
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute with all fields preserved", () => {
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-01-02");
      const sub = ProjectSubmission.reconstitute(
        ProjectSubmissionId.create("sub-1"),
        UserId.create("user-1"),
        RoadmapItemId.create("item-1"),
        "https://github.com/user/repo",
        85,
        "Great work",
        ProjectSubmissionStatus.Completed,
        createdAt,
        updatedAt,
      );

      expect(sub.score).toBe(85);
      expect(sub.feedback).toBe("Great work");
      expect(sub.status).toBe(ProjectSubmissionStatus.Completed);
      expect(sub.createdAt).toEqual(createdAt);
      expect(sub.updatedAt).toEqual(updatedAt);
    });
  });

  describe("markAsAnalyzing", () => {
    it("should transition from pending to analyzing", () => {
      const sub = makeSubmission();

      sub.markAsAnalyzing();

      expect(sub.status).toBe(ProjectSubmissionStatus.Analyzing);
    });

    it("should reject if not in pending state", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      expect(() => sub.markAsAnalyzing()).toThrow(
        "Cannot mark as analyzing: submission is not in pending state",
      );
    });
  });

  describe("completeAnalysis", () => {
    it("should complete with valid score and feedback", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      sub.completeAnalysis(90, "Excellent implementation");

      expect(sub.status).toBe(ProjectSubmissionStatus.Completed);
      expect(sub.score).toBe(90);
      expect(sub.feedback).toBe("Excellent implementation");
    });

    it("should reject if not in analyzing state", () => {
      const sub = makeSubmission();

      expect(() => sub.completeAnalysis(90, "Good")).toThrow(
        "Cannot complete analysis: submission is not in analyzing state",
      );
    });

    it("should reject score below 0", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      expect(() => sub.completeAnalysis(-1, "Feedback")).toThrow(
        "ProjectSubmission score must be between 0 and 100",
      );
    });

    it("should reject score above 100", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      expect(() => sub.completeAnalysis(101, "Feedback")).toThrow(
        "ProjectSubmission score must be between 0 and 100",
      );
    });

    it("should accept score of 0", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      sub.completeAnalysis(0, "Needs improvement");

      expect(sub.score).toBe(0);
    });

    it("should accept score of 100", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      sub.completeAnalysis(100, "Perfect");

      expect(sub.score).toBe(100);
    });

    it("should reject empty feedback", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      expect(() => sub.completeAnalysis(80, "")).toThrow(
        "ProjectSubmission feedback cannot be empty",
      );
    });

    it("should reject whitespace-only feedback", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      expect(() => sub.completeAnalysis(80, "   ")).toThrow(
        "ProjectSubmission feedback cannot be empty",
      );
    });

    it("should trim feedback", () => {
      const sub = makeSubmission();
      sub.markAsAnalyzing();

      sub.completeAnalysis(80, "  Good work  ");

      expect(sub.feedback).toBe("Good work");
    });
  });

  describe("markAsFailed", () => {
    it("should mark as failed with feedback", () => {
      const sub = makeSubmission();

      sub.markAsFailed("Repository not found");

      expect(sub.status).toBe(ProjectSubmissionStatus.Failed);
      expect(sub.feedback).toBe("Repository not found");
    });

    it("should reject empty feedback", () => {
      const sub = makeSubmission();

      expect(() => sub.markAsFailed("")).toThrow(
        "Failure feedback cannot be empty",
      );
    });

    it("should reject whitespace-only feedback", () => {
      const sub = makeSubmission();

      expect(() => sub.markAsFailed("   ")).toThrow(
        "Failure feedback cannot be empty",
      );
    });

    it("should trim feedback", () => {
      const sub = makeSubmission();

      sub.markAsFailed("  API error  ");

      expect(sub.feedback).toBe("API error");
    });
  });
});
