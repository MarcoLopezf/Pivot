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

  describe("analyzeRepository", () => {
    describe("URL Validation (SSRF Protection)", () => {
      it("should reject non-GitHub URLs", async () => {
        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://evil.com/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");
      });

      it("should reject localhost URLs", async () => {
        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://localhost/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");
      });

      it("should reject private IP addresses", async () => {
        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://192.168.1.1/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");

        await expect(
          service.analyzeRepository("https://10.0.0.1/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");

        await expect(
          service.analyzeRepository("https://172.16.0.1/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");
      });

      it("should reject URLs without https", async () => {
        const service = new GitHubService();

        await expect(
          service.analyzeRepository("http://github.com/user/repo"),
        ).rejects.toThrow("Invalid GitHub repository URL");
      });

      it("should reject empty or invalid URLs", async () => {
        const service = new GitHubService();

        await expect(service.analyzeRepository("")).rejects.toThrow(
          "Invalid GitHub repository URL",
        );

        await expect(service.analyzeRepository("not-a-url")).rejects.toThrow(
          "Invalid GitHub repository URL",
        );
      });

      it("should accept valid GitHub repository URLs", async () => {
        const mockFileTree = {
          tree: [{ path: "README.md", type: "blob", size: 100, sha: "abc123" }],
        };

        const mockReadmeContent = { content: "IyBSRUFETUU=" }; // Base64 for "# README"

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json(mockReadmeContent);
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        expect(result).toBeDefined();
        expect(result.files).toBeDefined();
      });
    });

    describe("Authentication Header", () => {
      it("should include Authorization header when GITHUB_ACCESS_TOKEN is set", async () => {
        const originalToken = process.env.GITHUB_ACCESS_TOKEN;
        process.env.GITHUB_ACCESS_TOKEN = "test-token-123";

        let requestHeaders: Headers | undefined;

        const mockFileTree = {
          tree: [{ path: "README.md", type: "blob", size: 100, sha: "abc123" }],
        };

        server.use(
          http.get(
            "https://api.github.com/repos/user/repo/git/trees/*",
            ({ request }) => {
              requestHeaders = request.headers;
              return HttpResponse.json(mockFileTree);
            },
          ),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "IyBSRUFETUU=" });
          }),
        );

        const service = new GitHubService();
        await service.analyzeRepository("https://github.com/user/repo");

        expect(requestHeaders?.get("Authorization")).toBe(
          "Bearer test-token-123",
        );

        // Cleanup
        if (originalToken) {
          process.env.GITHUB_ACCESS_TOKEN = originalToken;
        } else {
          delete process.env.GITHUB_ACCESS_TOKEN;
        }
      });

      it("should NOT include Authorization header when GITHUB_ACCESS_TOKEN is not set", async () => {
        const originalToken = process.env.GITHUB_ACCESS_TOKEN;
        delete process.env.GITHUB_ACCESS_TOKEN;

        let requestHeaders: Headers | undefined;

        const mockFileTree = {
          tree: [{ path: "README.md", type: "blob", size: 100, sha: "abc123" }],
        };

        server.use(
          http.get(
            "https://api.github.com/repos/user/repo/git/trees/*",
            ({ request }) => {
              requestHeaders = request.headers;
              return HttpResponse.json(mockFileTree);
            },
          ),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "IyBSRUFETUU=" });
          }),
        );

        const service = new GitHubService();
        await service.analyzeRepository("https://github.com/user/repo");

        expect(requestHeaders?.get("Authorization")).toBeNull();

        // Cleanup
        if (originalToken) {
          process.env.GITHUB_ACCESS_TOKEN = originalToken;
        }
      });
    });

    describe("Repository Analysis - Smart Fetch", () => {
      it("should fetch file tree first, then fetch relevant files", async () => {
        const mockFileTree = {
          tree: [
            { path: "README.md", type: "blob", size: 1024, sha: "abc123" },
            { path: "package.json", type: "blob", size: 512, sha: "def456" },
            { path: "src/index.ts", type: "blob", size: 2048, sha: "ghi789" },
            {
              path: "node_modules/lib.js",
              type: "blob",
              size: 5000,
              sha: "jkl012",
            },
            {
              path: "large-file.bin",
              type: "blob",
              size: 200000,
              sha: "mno345",
            },
          ],
        };

        const mockReadmeContent = { content: "IyBQcm9qZWN0" }; // Base64 for "# Project"
        const mockPackageJson = { content: "eyJuYW1lIjogInRlc3QifQ==" }; // Base64 for {"name": "test"}
        const mockIndexTs = { content: "Y29uc3QgeCA9IDE7" }; // Base64 for "const x = 1;"

        let treeCalled = false;

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            treeCalled = true;
            return HttpResponse.json(mockFileTree);
          }),
          http.get(
            "https://api.github.com/repos/user/repo/git/blobs/*",
            ({ request }) => {
              const url = new URL(request.url);
              const sha = url.pathname.split("/").pop();

              if (sha === "abc123") return HttpResponse.json(mockReadmeContent);
              if (sha === "def456") return HttpResponse.json(mockPackageJson);
              if (sha === "ghi789") return HttpResponse.json(mockIndexTs);

              return HttpResponse.json({ content: "ZGVmYXVsdA==" });
            },
          ),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        expect(treeCalled).toBe(true);
        expect(result).toBeDefined();
        expect(result.files).toBeDefined();
        expect(result.files.length).toBeGreaterThan(0);

        // Verify it excluded node_modules and large files
        const filePaths = result.files.map((f) => f.path);
        expect(filePaths).not.toContain("node_modules/lib.js");
        expect(filePaths).not.toContain("large-file.bin");
      });

      it("should limit the number of files fetched to 10", async () => {
        const mockFileTree = {
          tree: Array.from({ length: 50 }, (_, i) => ({
            path: `src/file${i}.ts`,
            type: "blob",
            size: 1024,
            sha: `sha${i}`,
          })),
        };

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "Y29kZQ==" });
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        expect(result.files.length).toBeLessThanOrEqual(10);
      });

      it("should respect file size limits (100KB per file)", async () => {
        const mockFileTree = {
          tree: [
            { path: "small.ts", type: "blob", size: 5000, sha: "abc" },
            { path: "huge.ts", type: "blob", size: 150000, sha: "def" },
          ],
        };

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "c21hbGw=" });
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        const filePaths = result.files.map((f) => f.path);
        expect(filePaths).toContain("small.ts");
        expect(filePaths).not.toContain("huge.ts");
      });

      it("should prioritize relevant files (README, package.json, src files)", async () => {
        const mockFileTree = {
          tree: [
            { path: "README.md", type: "blob", size: 1000, sha: "readme" },
            { path: "package.json", type: "blob", size: 500, sha: "pkg" },
            { path: "src/index.ts", type: "blob", size: 1000, sha: "index" },
            { path: "tests/test.ts", type: "blob", size: 1000, sha: "test" },
            { path: ".gitignore", type: "blob", size: 100, sha: "git" },
          ],
        };

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "Y29udGVudA==" });
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        const filePaths = result.files.map((f) => f.path);
        expect(filePaths).toContain("README.md");
        expect(filePaths).toContain("package.json");
        expect(filePaths).toContain("src/index.ts");
      });
    });

    describe("Error Handling", () => {
      it("should handle 404 errors gracefully (repository not found)", async () => {
        server.use(
          http.get(
            "https://api.github.com/repos/user/nonexistent/git/trees/*",
            () => {
              return new HttpResponse(null, { status: 404 });
            },
          ),
        );

        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://github.com/user/nonexistent"),
        ).rejects.toThrow("Repository not found or is private");
      });

      it("should handle private repositories gracefully (403 Forbidden)", async () => {
        server.use(
          http.get(
            "https://api.github.com/repos/user/private-repo/git/trees/*",
            () => {
              return new HttpResponse(null, { status: 403 });
            },
          ),
        );

        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://github.com/user/private-repo"),
        ).rejects.toThrow("Repository not found or is private");
      });

      it("should handle network errors", async () => {
        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.error();
          }),
        );

        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://github.com/user/repo"),
        ).rejects.toThrow("Failed to analyze repository");
      });

      it("should handle rate limiting (429)", async () => {
        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return new HttpResponse(null, { status: 429 });
          }),
        );

        const service = new GitHubService();

        await expect(
          service.analyzeRepository("https://github.com/user/repo"),
        ).rejects.toThrow("GitHub API rate limit exceeded");
      });
    });

    describe("Return Value Structure", () => {
      it("should return structured data with files and metadata", async () => {
        const mockFileTree = {
          tree: [{ path: "README.md", type: "blob", size: 100, sha: "abc" }],
        };

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json({ content: "IyBSRUFETUU=" });
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        expect(result).toHaveProperty("files");
        expect(result).toHaveProperty("metadata");
        expect(Array.isArray(result.files)).toBe(true);
        expect(result.files[0]).toHaveProperty("path");
        expect(result.files[0]).toHaveProperty("content");
        expect(result.metadata).toHaveProperty("repoUrl");
        expect(result.metadata).toHaveProperty("fileCount");
      });

      it("should decode base64 content correctly", async () => {
        const mockFileTree = {
          tree: [{ path: "test.ts", type: "blob", size: 100, sha: "abc" }],
        };

        // Base64 for "const x = 1;"
        const mockContent = { content: "Y29uc3QgeCA9IDE7" };

        server.use(
          http.get("https://api.github.com/repos/user/repo/git/trees/*", () => {
            return HttpResponse.json(mockFileTree);
          }),
          http.get("https://api.github.com/repos/user/repo/git/blobs/*", () => {
            return HttpResponse.json(mockContent);
          }),
        );

        const service = new GitHubService();
        const result = await service.analyzeRepository(
          "https://github.com/user/repo",
        );

        expect(result.files[0].content).toBe("const x = 1;");
      });
    });
  });
});
