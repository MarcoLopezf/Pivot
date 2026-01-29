import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { POST } from "@/app/api/learning/goals/route";
import { NextRequest } from "next/server";

// Mock the AI flow to avoid requiring OpenAI API key in tests
vi.mock("@infrastructure/ai/flows/generateRoadmapFlow", () => {
  class MockGenkitRoadmapFlow {
    async generate() {
      return [
        {
          title: "Learn TypeScript Fundamentals",
          description:
            "Master TypeScript basics including types, interfaces, and generics to write type-safe code.",
          order: 1,
        },
        {
          title: "Build REST APIs with Node.js",
          description:
            "Create production-ready APIs with Express, authentication, and error handling.",
          order: 2,
        },
        {
          title: "Master Database Design",
          description:
            "Learn SQL, database normalization, and query optimization for scalable applications.",
          order: 3,
        },
        {
          title: "Study System Design Patterns",
          description:
            "Understand architectural patterns, caching, and distributed systems fundamentals.",
          order: 4,
        },
        {
          title: "Build Portfolio Projects",
          description:
            "Create full-stack projects demonstrating your skills to potential employers.",
          order: 5,
        },
      ];
    }
  }

  return {
    GenkitRoadmapFlow: MockGenkitRoadmapFlow,
  };
});

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "POST /api/learning/goals (integration) — requires DATABASE_URL",
  () => {
    let testUserId: string;

    beforeEach(async () => {
      // Clean up only our own test records to avoid conflicts with parallel test files
      // Clean roadmaps first (FK constraint)
      await prisma.roadmapItem.deleteMany({
        where: { roadmap: { goal: { userId: "test-user-goals" } } },
      });
      await prisma.roadmap.deleteMany({
        where: { goal: { userId: "test-user-goals" } },
      });
      await prisma.careerGoal.deleteMany({
        where: { userId: "test-user-goals" },
      });
      await prisma.user.deleteMany({ where: { id: "test-user-goals" } });

      // Create a test user
      const user = await prisma.user.upsert({
        where: { id: "test-user-goals" },
        create: {
          id: "test-user-goals",
          email: "goalstest@example.com",
          name: "Goals Test User",
          role: "USER",
        },
        update: {},
      });
      testUserId = user.id;
    });

    it("should create a new career goal and automatically generate roadmap", async () => {
      const requestBody = {
        userId: testUserId,
        currentRole: "Junior Backend Developer",
        targetRole: "Senior Backend Developer",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/learning/goals",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("success", true);

      // Verify goal was created
      expect(data.data).toHaveProperty("goal");
      expect(data.data.goal).toHaveProperty("id");
      expect(data.data.goal).toHaveProperty("userId", testUserId);
      expect(data.data.goal).toHaveProperty(
        "currentRole",
        "Junior Backend Developer",
      );
      expect(data.data.goal).toHaveProperty(
        "targetRole",
        "Senior Backend Developer",
      );
      expect(data.data.goal).toHaveProperty("createdAt");
      expect(data.data.goal).toHaveProperty("updatedAt");

      // Verify roadmap was automatically generated
      expect(data.data).toHaveProperty("roadmap");
      expect(data.data.roadmap).toHaveProperty("id");
      expect(data.data.roadmap).toHaveProperty("goalId", data.data.goal.id);
      expect(data.data.roadmap).toHaveProperty(
        "title",
        "Roadmap to Senior Backend Developer",
      );
      expect(data.data.roadmap).toHaveProperty("progress", 0);
      expect(data.data.roadmap).toHaveProperty("items");
      expect(Array.isArray(data.data.roadmap.items)).toBe(true);
      expect(data.data.roadmap.items.length).toBeGreaterThan(0);

      // Verify roadmap items have correct structure
      const firstItem = data.data.roadmap.items[0];
      expect(firstItem).toHaveProperty("id");
      expect(firstItem).toHaveProperty("title");
      expect(firstItem).toHaveProperty("description");
      expect(firstItem).toHaveProperty("order");
      expect(firstItem).toHaveProperty("status", "pending");
    });

    it("should return 400 when targetRole is empty", async () => {
      const requestBody = {
        userId: testUserId,
        currentRole: "Junior Backend Developer",
        targetRole: "",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/learning/goals",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
      expect(data.error.message).toContain("Target role cannot be empty");
    });

    it("should return 400 when currentRole is empty", async () => {
      const requestBody = {
        userId: testUserId,
        currentRole: "",
        targetRole: "Senior Backend Developer",
      };

      const request = new NextRequest(
        "http://localhost:3000/api/learning/goals",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");
    });

    it("should return 400 when request body is missing fields", async () => {
      const requestBody = {
        userId: testUserId,
        currentRole: "Junior Backend Developer",
        // Missing targetRole
      };

      const request = new NextRequest(
        "http://localhost:3000/api/learning/goals",
        {
          method: "POST",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "INVALID_REQUEST_BODY");
    });

    it("should return 400 when request body is malformed JSON", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/learning/goals",
        {
          method: "POST",
          body: "not-json",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "INVALID_JSON");
    });
  },
);
