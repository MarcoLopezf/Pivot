import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { POST } from "@/app/api/learning/goals/route";
import { NextRequest } from "next/server";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "POST /api/learning/goals (integration) — requires DATABASE_URL",
  () => {
    let testUserId: string;

    beforeEach(async () => {
      // Clean up only our own test records to avoid conflicts with parallel test files
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

    it("should create a new career goal and return 201", async () => {
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
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("userId", testUserId);
      expect(data.data).toHaveProperty(
        "currentRole",
        "Junior Backend Developer",
      );
      expect(data.data).toHaveProperty(
        "targetRole",
        "Senior Backend Developer",
      );
      expect(data.data).toHaveProperty("createdAt");
      expect(data.data).toHaveProperty("updatedAt");
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
