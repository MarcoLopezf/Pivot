import { describe, it, expect } from "vitest";
import { ProjectSubmissionMapper } from "@infrastructure/database/mappers/ProjectSubmissionMapper";
import {
  ProjectSubmission,
  ProjectSubmissionStatus,
} from "@domain/assessment/entities/ProjectSubmission";
import { ProjectSubmissionId } from "@domain/assessment/value-objects/ProjectSubmissionId";
import { UserId } from "@domain/profile/value-objects/UserId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";
import type { ProjectSubmissionStatus as PrismaProjectSubmissionStatus } from "@prisma/client";

describe("ProjectSubmissionMapper", () => {
  const now = new Date("2024-01-01");
  const later = new Date("2024-01-02");

  describe("toDomain", () => {
    it("should convert Prisma PENDING submission to domain entity", () => {
      const prisma = {
        id: "sub-1",
        userId: "user-1",
        roadmapItemId: "item-1",
        repoUrl: "https://github.com/user/repo",
        score: null,
        feedback: null,
        status: "PENDING" as PrismaProjectSubmissionStatus,
        createdAt: now,
        updatedAt: later,
      };

      const domain = ProjectSubmissionMapper.toDomain(prisma);

      expect(domain.id.value).toBe("sub-1");
      expect(domain.status).toBe(ProjectSubmissionStatus.Pending);
      expect(domain.score).toBeNull();
    });

    it("should convert Prisma COMPLETED submission to domain entity", () => {
      const prisma = {
        id: "sub-2",
        userId: "user-1",
        roadmapItemId: "item-1",
        repoUrl: "https://github.com/user/repo",
        score: 85,
        feedback: "Good work",
        status: "COMPLETED" as PrismaProjectSubmissionStatus,
        createdAt: now,
        updatedAt: later,
      };

      const domain = ProjectSubmissionMapper.toDomain(prisma);

      expect(domain.status).toBe(ProjectSubmissionStatus.Completed);
      expect(domain.score).toBe(85);
      expect(domain.feedback).toBe("Good work");
    });

    it("should convert ANALYZING status", () => {
      const prisma = {
        id: "sub-3",
        userId: "user-1",
        roadmapItemId: "item-1",
        repoUrl: "https://github.com/user/repo",
        score: null,
        feedback: null,
        status: "ANALYZING" as PrismaProjectSubmissionStatus,
        createdAt: now,
        updatedAt: later,
      };

      const domain = ProjectSubmissionMapper.toDomain(prisma);
      expect(domain.status).toBe(ProjectSubmissionStatus.Analyzing);
    });

    it("should convert FAILED status", () => {
      const prisma = {
        id: "sub-4",
        userId: "user-1",
        roadmapItemId: "item-1",
        repoUrl: "https://github.com/user/repo",
        score: null,
        feedback: "Repo not found",
        status: "FAILED" as PrismaProjectSubmissionStatus,
        createdAt: now,
        updatedAt: later,
      };

      const domain = ProjectSubmissionMapper.toDomain(prisma);
      expect(domain.status).toBe(ProjectSubmissionStatus.Failed);
    });

    it("should default to Pending for unknown status", () => {
      const prisma = {
        id: "sub-5",
        userId: "user-1",
        roadmapItemId: "item-1",
        repoUrl: "https://github.com/user/repo",
        score: null,
        feedback: null,
        status: "UNKNOWN_STATUS" as PrismaProjectSubmissionStatus,
        createdAt: now,
        updatedAt: later,
      };

      const domain = ProjectSubmissionMapper.toDomain(prisma);
      expect(domain.status).toBe(ProjectSubmissionStatus.Pending);
    });
  });

  describe("toPersistence", () => {
    it("should convert domain Pending submission to Prisma format", () => {
      const submission = ProjectSubmission.reconstitute(
        ProjectSubmissionId.create("sub-1"),
        UserId.create("user-1"),
        RoadmapItemId.create("item-1"),
        "https://github.com/user/repo",
        null,
        null,
        ProjectSubmissionStatus.Pending,
        now,
        later,
      );

      const persistence = ProjectSubmissionMapper.toPersistence(submission);

      expect(persistence.id).toBe("sub-1");
      expect(persistence.status).toBe("PENDING");
      expect(persistence.score).toBeNull();
    });

    it("should convert domain Completed submission to Prisma format", () => {
      const submission = ProjectSubmission.reconstitute(
        ProjectSubmissionId.create("sub-2"),
        UserId.create("user-1"),
        RoadmapItemId.create("item-1"),
        "https://github.com/user/repo",
        90,
        "Excellent",
        ProjectSubmissionStatus.Completed,
        now,
        later,
      );

      const persistence = ProjectSubmissionMapper.toPersistence(submission);

      expect(persistence.status).toBe("COMPLETED");
      expect(persistence.score).toBe(90);
      expect(persistence.feedback).toBe("Excellent");
    });

    it("should convert all status types correctly", () => {
      const statuses: [ProjectSubmissionStatus, string][] = [
        [ProjectSubmissionStatus.Pending, "PENDING"],
        [ProjectSubmissionStatus.Analyzing, "ANALYZING"],
        [ProjectSubmissionStatus.Completed, "COMPLETED"],
        [ProjectSubmissionStatus.Failed, "FAILED"],
      ];

      for (const [domainStatus, prismaStatus] of statuses) {
        const submission = ProjectSubmission.reconstitute(
          ProjectSubmissionId.create("sub-1"),
          UserId.create("user-1"),
          RoadmapItemId.create("item-1"),
          "https://github.com/user/repo",
          null,
          null,
          domainStatus,
          now,
          later,
        );

        const persistence = ProjectSubmissionMapper.toPersistence(submission);
        expect(persistence.status).toBe(prismaStatus);
      }
    });
  });
});
