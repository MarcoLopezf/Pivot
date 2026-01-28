import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { POST } from "@/app/api/profile/route";
import { NextRequest } from "next/server";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "POST /api/profile (integration) — requires DATABASE_URL",
  () => {
    beforeEach(async () => {
      // Clean up test data before each test
      await prisma.user.deleteMany();
    });

    it("should create a new user and return 201", async () => {
      const requestBody = {
        name: "John Doe",
        email: "john.doe@example.com",
      };

      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty("success", true);
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("email", "john.doe@example.com");
      expect(data.data).toHaveProperty("name", "John Doe");
      expect(data.data).toHaveProperty("role");
      expect(data.data).toHaveProperty("createdAt");
      expect(data.data).toHaveProperty("updatedAt");
    });

    it("should return 409 when user with email already exists", async () => {
      const requestBody = {
        name: "Jane Doe",
        email: "duplicate@example.com",
      };

      // First request - create user
      const request1 = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request1);

      // Second request - attempt duplicate
      const request2 = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request2);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "USER_ALREADY_EXISTS");
      expect(data.error.message).toContain("duplicate@example.com");
    });

    it("should return 400 when email is invalid", async () => {
      const requestBody = {
        name: "Bad Email User",
        email: "not-an-email",
      };

      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "INVALID_EMAIL");
    });

    it("should return 400 when request body is missing required fields", async () => {
      const requestBody = {
        name: "Missing Email",
      };

      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code");
    });

    it("should return 400 when request body is malformed JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/profile", {
        method: "POST",
        body: "not-json",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("success", false);
      expect(data.error).toHaveProperty("code", "INVALID_JSON");
    });
  },
);
