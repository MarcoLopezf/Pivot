import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/learning/suggestions/route";
import { NextRequest } from "next/server";

describe("POST /api/learning/suggestions (integration)", () => {
  it("should return 400 when currentRole is missing", async () => {
    const requestBody = {
      skills: ["JavaScript", "TypeScript"],
      // Missing currentRole
    };

    const request = new NextRequest(
      "http://localhost:3000/api/learning/suggestions",
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

  it("should return 400 when currentRole is empty", async () => {
    const requestBody = {
      currentRole: "",
      skills: ["JavaScript", "TypeScript"],
    };

    const request = new NextRequest(
      "http://localhost:3000/api/learning/suggestions",
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
    expect(data.error.message).toContain("Current role cannot be empty");
  });

  it("should return 400 when skills array is empty", async () => {
    const requestBody = {
      currentRole: "Junior Developer",
      skills: [],
    };

    const request = new NextRequest(
      "http://localhost:3000/api/learning/suggestions",
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
    expect(data.error.message).toContain(
      "Skills array must contain at least one skill",
    );
  });

  it("should return 400 when skills is not an array", async () => {
    const requestBody = {
      currentRole: "Junior Developer",
      skills: "JavaScript", // Should be array
    };

    const request = new NextRequest(
      "http://localhost:3000/api/learning/suggestions",
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
      "http://localhost:3000/api/learning/suggestions",
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

  // Note: We skip testing the actual AI call (200 success case) because:
  // 1. It requires GOOGLE_AI_API_KEY environment variable
  // 2. It makes real API calls which are slow and costly
  // 3. The AI response is non-deterministic
  // The AI integration is tested separately in manual/E2E tests
});
