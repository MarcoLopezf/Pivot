import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { GitHubService } from "@infrastructure/services/GitHubService";

/**
 * Unit tests for GitHubService
 *
 * Tests the GitHub API integration service using MSW to mock HTTP requests.
 * Ensures proper error handling and data formatting.
 */

// Mock GitHub API response type
interface MockGitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  updated_at: string;
}

// Setup MSW server for mocking GitHub API
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("GitHubService", () => {
  describe("analyzeProfile", () => {
    it("should return empty string when username is empty", async () => {
      const service = new GitHubService();

      const result = await service.analyzeProfile("");

      expect(result).toBe("");
    });

    it("should return empty string when username is whitespace", async () => {
      const service = new GitHubService();

      const result = await service.analyzeProfile("   ");

      expect(result).toBe("");
    });

    it("should return empty string when user is not found (404)", async () => {
      const username = "nonexistentuser123";

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return new HttpResponse(null, { status: 404 });
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toBe("");
    });

    it("should return empty string when user has no repositories", async () => {
      const username = "emptyuser";

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.json([]);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toBe("");
    });

    it("should return formatted summary for user with repositories", async () => {
      const username = "testuser";
      const mockRepos: MockGitHubRepo[] = [
        {
          name: "pivot",
          description: "AI-powered learning platform",
          language: "TypeScript",
          topics: ["nextjs", "ai", "learning"],
          updated_at: "2026-01-30T10:00:00Z",
        },
        {
          name: "react-app",
          description: "React application",
          language: "JavaScript",
          topics: ["react", "frontend"],
          updated_at: "2026-01-25T14:30:00Z",
        },
      ];

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.json(mockRepos);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toContain("GITHUB CONTEXT:");
      expect(result).toContain("- pivot (TypeScript)");
      expect(result).toContain("AI-powered learning platform");
      expect(result).toContain("Topics: nextjs, ai, learning");
      expect(result).toContain("Updated: 2026-01-30");
      expect(result).toContain("- react-app (JavaScript)");
      expect(result).toContain("React application");
      expect(result).toContain("Topics: react, frontend");
      expect(result).toContain("Updated: 2026-01-25");
    });

    it("should handle repositories without description", async () => {
      const username = "testuser";
      const mockRepos: MockGitHubRepo[] = [
        {
          name: "test-repo",
          description: null,
          language: "Python",
          topics: [],
          updated_at: "2026-01-20T12:00:00Z",
        },
      ];

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.json(mockRepos);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toContain("- test-repo (Python)");
      expect(result).toContain("Updated: 2026-01-20");
      expect(result).not.toContain("null");
    });

    it("should handle repositories without language", async () => {
      const username = "testuser";
      const mockRepos: MockGitHubRepo[] = [
        {
          name: "markdown-docs",
          description: "Documentation repository",
          language: null,
          topics: ["docs"],
          updated_at: "2026-01-15T08:00:00Z",
        },
      ];

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.json(mockRepos);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toContain("- markdown-docs:");
      expect(result).toContain("Documentation repository");
      expect(result).toContain("Topics: docs");
      expect(result).not.toContain("(null)");
    });

    it("should handle repositories without topics", async () => {
      const username = "testuser";
      const mockRepos: MockGitHubRepo[] = [
        {
          name: "simple-app",
          description: "Simple application",
          language: "Go",
          topics: [],
          updated_at: "2026-01-10T16:45:00Z",
        },
      ];

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.json(mockRepos);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toContain("- simple-app (Go)");
      expect(result).toContain("Simple application");
      expect(result).not.toContain("Topics:");
    });

    it("should trim username whitespace before making request", async () => {
      const username = "  testuser  ";
      const mockRepos: MockGitHubRepo[] = [
        {
          name: "repo",
          description: "Test",
          language: "Rust",
          topics: [],
          updated_at: "2026-01-01T00:00:00Z",
        },
      ];

      server.use(
        http.get("https://api.github.com/users/testuser/repos", () => {
          return HttpResponse.json(mockRepos);
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toContain("- repo (Rust)");
    });

    it("should return empty string on network error", async () => {
      const username = "testuser";

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return HttpResponse.error();
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toBe("");
    });

    it("should return empty string on server error (500)", async () => {
      const username = "testuser";

      server.use(
        http.get(`https://api.github.com/users/${username}/repos`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const service = new GitHubService();
      const result = await service.analyzeProfile(username);

      expect(result).toBe("");
    });

    it("should send correct headers and query params", async () => {
      const username = "testuser";
      let requestHeaders: Headers | undefined;
      let requestUrl: URL | undefined;

      server.use(
        http.get(
          `https://api.github.com/users/${username}/repos`,
          ({ request }) => {
            requestHeaders = request.headers;
            requestUrl = new URL(request.url);
            return HttpResponse.json([]);
          },
        ),
      );

      const service = new GitHubService();
      await service.analyzeProfile(username);

      expect(requestHeaders?.get("User-Agent")).toBe("PivotApp");
      expect(requestUrl?.searchParams.get("sort")).toBe("updated");
      expect(requestUrl?.searchParams.get("per_page")).toBe("10");
    });
  });
});
