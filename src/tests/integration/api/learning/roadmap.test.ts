import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { GET } from "@/app/api/learning/roadmap/route";
import { NextRequest } from "next/server";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "GET /api/learning/roadmap (integration) — requires DATABASE_URL",
  () => {
    const testUserId = "test-user-get-roadmap-001";
    const testGoalId = "test-goal-get-roadmap-001";

    beforeEach(async () => {
      // Clean up test data
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goalId: testGoalId } },
      });
      await prisma.roadmap.deleteMany({ where: { goalId: testGoalId } });
      await prisma.careerGoal.deleteMany({ where: { id: testGoalId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("should return 400 when userId query param is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap",
        { method: "GET" },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("MISSING_USER_ID");
    });

    it("should return 404 when no roadmap exists for user", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/learning/roadmap?userId=${testUserId}`,
        { method: "GET" },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ROADMAP_NOT_FOUND");
    });

    it("should return 200 with roadmap when it exists", async () => {
      // Create user, goal, and roadmap
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-get-roadmap@example.com",
          name: "Test User",
        },
      });

      await prisma.careerGoal.create({
        data: {
          id: testGoalId,
          userId: testUserId,
          targetRole: "Senior Engineer",
          currentRole: "Junior Engineer",
        },
      });

      await prisma.roadmap.create({
        data: {
          id: "roadmap-get-test-001",
          goalId: testGoalId,
          title: "Test Roadmap",
          items: {
            create: [
              {
                id: "item-get-test-001",
                title: "Learn TypeScript",
                description: "Study TS fundamentals",
                order: 1,
                status: "COMPLETED",
              },
              {
                id: "item-get-test-002",
                title: "Learn React",
                description: "Study React hooks",
                order: 2,
                status: "IN_PROGRESS",
              },
            ],
          },
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/learning/roadmap?userId=${testUserId}`,
        { method: "GET" },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: "roadmap-get-test-001",
        title: "Test Roadmap",
        goalId: testGoalId,
      });
      expect(data.data.items).toHaveLength(2);
      expect(data.data.items[0].status).toBe("completed");
      expect(data.data.items[1].status).toBe("in_progress");
      expect(data.data.progress).toBe(50);
    });

    it("should return latest roadmap when multiple exist", async () => {
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-latest@example.com",
          name: "Test User",
        },
      });

      await prisma.careerGoal.create({
        data: {
          id: testGoalId,
          userId: testUserId,
          targetRole: "Senior Engineer",
          currentRole: "Junior Engineer",
        },
      });

      // Create first roadmap
      await prisma.roadmap.create({
        data: {
          id: "roadmap-latest-001",
          goalId: testGoalId,
          title: "First Roadmap",
          items: {
            create: {
              id: "item-latest-001",
              title: "Item 1",
              description: "desc",
              order: 1,
              status: "PENDING",
            },
          },
        },
      });

      // Wait a bit and create second roadmap
      await new Promise((resolve) => setTimeout(resolve, 10));

      await prisma.roadmap.create({
        data: {
          id: "roadmap-latest-002",
          goalId: testGoalId,
          title: "Latest Roadmap",
          items: {
            create: {
              id: "item-latest-002",
              title: "Item 2",
              description: "desc",
              order: 1,
              status: "PENDING",
            },
          },
        },
      });

      const request = new NextRequest(
        `http://localhost:3000/api/learning/roadmap?userId=${testUserId}`,
        { method: "GET" },
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.id).toBe("roadmap-latest-002");
      expect(data.data.title).toBe("Latest Roadmap");
    });
  },
);
