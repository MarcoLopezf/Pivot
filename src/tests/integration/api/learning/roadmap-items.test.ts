import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { PATCH } from "@/app/api/learning/roadmap/items/[itemId]/route";
import { NextRequest } from "next/server";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "PATCH /api/learning/roadmap/items/[itemId] (integration) — requires DATABASE_URL",
  () => {
    const testUserId = "test-user-patch-items-001";
    const testGoalId = "test-goal-patch-items-001";
    const testRoadmapId = "roadmap-patch-test-001";

    beforeEach(async () => {
      // Clean up test data
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goalId: testGoalId } },
      });
      await prisma.roadmap.deleteMany({ where: { goalId: testGoalId } });
      await prisma.careerGoal.deleteMany({ where: { id: testGoalId } });
      await prisma.user.deleteMany({ where: { id: testUserId } });
    });

    it("should return 400 when request body is missing roadmapId", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-001",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "in_progress" }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("roadmapId");
    });

    it("should return 400 when request body is missing status", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-001",
        {
          method: "PATCH",
          body: JSON.stringify({ roadmapId: testRoadmapId }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(data.error.message).toContain("status");
    });

    it("should return 400 when status is invalid", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-001",
        {
          method: "PATCH",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            status: "invalid_status",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should return 404 when roadmap not found", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-001",
        {
          method: "PATCH",
          body: JSON.stringify({
            roadmapId: "nonexistent-roadmap",
            status: "in_progress",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ROADMAP_NOT_FOUND");
    });

    it("should return 404 when item not found in roadmap", async () => {
      // Create user, goal, and roadmap
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-patch-items@example.com",
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
          id: testRoadmapId,
          goalId: testGoalId,
          title: "Test Roadmap",
          items: {
            create: {
              id: "item-patch-001",
              title: "Item 1",
              description: "desc",
              order: 1,
              status: "PENDING",
            },
          },
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/nonexistent-item",
        {
          method: "PATCH",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            status: "in_progress",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "nonexistent-item" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("ITEM_NOT_FOUND");
    });

    it("should update item status from pending to in_progress", async () => {
      // Create user, goal, and roadmap
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-patch-update@example.com",
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
          id: testRoadmapId,
          goalId: testGoalId,
          title: "Test Roadmap",
          items: {
            create: [
              {
                id: "item-patch-001",
                title: "Item 1",
                description: "desc",
                order: 1,
                status: "PENDING",
              },
              {
                id: "item-patch-002",
                title: "Item 2",
                description: "desc",
                order: 2,
                status: "PENDING",
              },
            ],
          },
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-patch-001",
        {
          method: "PATCH",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            status: "in_progress",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-patch-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items[0].status).toBe("in_progress");
      expect(data.data.items[1].status).toBe("pending");
    });

    it("should update progress when item status changes", async () => {
      // Create user, goal, and roadmap
      await prisma.user.create({
        data: {
          id: testUserId,
          email: "test-patch-progress@example.com",
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
          id: testRoadmapId,
          goalId: testGoalId,
          title: "Test Roadmap",
          items: {
            create: [
              {
                id: "item-patch-001",
                title: "Item 1",
                description: "desc",
                order: 1,
                status: "PENDING",
              },
              {
                id: "item-patch-002",
                title: "Item 2",
                description: "desc",
                order: 2,
                status: "PENDING",
              },
            ],
          },
        },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/learning/roadmap/items/item-patch-001",
        {
          method: "PATCH",
          body: JSON.stringify({
            roadmapId: testRoadmapId,
            status: "completed",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PATCH(request, {
        params: Promise.resolve({ itemId: "item-patch-001" }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.progress).toBe(50);
    });
  },
);
