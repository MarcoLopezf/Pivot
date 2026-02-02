import axios, { AxiosError } from "axios";
import { z } from "zod";

/**
 * GitHubService - Infrastructure service for GitHub API integration
 *
 * Provides functionality to:
 * 1. Analyze a user's public GitHub profile
 * 2. Analyze repository code for project validation
 *
 * Infrastructure Layer - Implements external dependency (axios)
 */

// Validation schema for GitHub repository URLs (SSRF protection)
const githubRepoUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname;
        // Must be https
        if (parsed.protocol !== "https:") return false;
        // Must be github.com (no other domains allowed)
        if (hostname !== "github.com") return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid GitHub repository URL" },
  );

interface RepositoryFile {
  path: string;
  content: string;
}

interface RepositoryAnalysisResult {
  files: RepositoryFile[];
  metadata: {
    repoUrl: string;
    fileCount: number;
  };
}

interface GitHubTreeItem {
  path: string;
  type: string;
  size: number;
  sha: string;
}

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_FILES = 10;

export class GitHubService {
  private readonly baseUrl = "https://api.github.com";

  /**
   * Analyzes a GitHub user's public repositories to extract technical context
   *
   * Fetches the user's most recently updated repositories and generates
   * a concise technical summary including languages, technologies, and topics.
   *
   * @param username - GitHub username to analyze
   * @returns Formatted string with GitHub context, or empty string if user not found or on error
   */
  async analyzeProfile(username: string): Promise<string> {
    if (!username || username.trim().length === 0) {
      return "";
    }

    try {
      const url = `${this.baseUrl}/users/${username.trim()}/repos`;
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "PivotApp",
        },
        params: {
          sort: "updated",
          per_page: 10,
        },
      });

      // Type the response data
      interface GitHubRepo {
        name: string;
        description: string | null;
        language: string | null;
        topics: string[];
        updated_at: string;
      }

      const repos = response.data as GitHubRepo[];

      if (!repos || repos.length === 0) {
        return "";
      }

      // Build formatted summary
      const repoSummaries = repos
        .map((repo) => {
          let line = `- ${repo.name}`;

          if (repo.language) {
            line += ` (${repo.language})`;
          }

          const details: string[] = [];

          if (repo.description) {
            details.push(repo.description);
          }

          if (repo.topics && repo.topics.length > 0) {
            details.push(`Topics: ${repo.topics.join(", ")}`);
          }

          if (details.length > 0) {
            line += `: ${details.join(". ")}`;
          }

          // Format date
          const updatedDate = new Date(repo.updated_at)
            .toISOString()
            .split("T")[0];
          line += `. Updated: ${updatedDate}`;

          return line;
        })
        .join("\n");

      return `GITHUB CONTEXT:\n${repoSummaries}`;
    } catch (error) {
      // Handle 404 - User not found
      if (error instanceof AxiosError && error.response?.status === 404) {
        console.log(`GitHub user not found: ${username}`);
        return "";
      }

      // Handle other errors - log and fail-safe
      console.error("Failed to fetch GitHub profile:", error);
      return "";
    }
  }

  /**
   * Analyzes a GitHub repository by fetching its code
   *
   * Uses "smart fetch" strategy:
   * 1. Fetch file tree to understand repository structure
   * 2. Select relevant files (README, package.json, src files, etc.)
   * 3. Fetch content of selected files (respecting size and count limits)
   *
   * Security:
   * - Validates URL to prevent SSRF attacks
   * - Limits file size (100KB per file)
   * - Limits number of files (10 files max)
   * - Excludes node_modules, .git, and other non-relevant directories
   *
   * @param repoUrl - Full GitHub repository URL (e.g., https://github.com/user/repo)
   * @returns Repository analysis with files and metadata
   * @throws Error if URL is invalid, repository not found, or API fails
   */
  async analyzeRepository(repoUrl: string): Promise<RepositoryAnalysisResult> {
    // Validate URL (SSRF protection)
    const validationResult = githubRepoUrlSchema.safeParse(repoUrl);
    if (!validationResult.success) {
      throw new Error("Invalid GitHub repository URL");
    }

    // Extract owner and repo from URL
    // Format: https://github.com/owner/repo
    const urlParts = repoUrl.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1]?.replace(/\.git$/, ""); // Remove .git if present

    if (!owner || !repo) {
      throw new Error("Invalid GitHub repository URL");
    }

    try {
      // Step 1: Fetch file tree
      const tree = await this.fetchFileTree(owner, repo);

      // Step 2: Select relevant files (smart filtering)
      const relevantFiles = this.selectRelevantFiles(tree);

      // Step 3: Fetch file contents
      const files = await this.fetchFileContents(owner, repo, relevantFiles);

      return {
        files,
        metadata: {
          repoUrl,
          fileCount: files.length,
        },
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          throw new Error("Repository not found or is private");
        }
        if (error.response?.status === 429) {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later or set GITHUB_ACCESS_TOKEN.",
          );
        }
        // Network errors (no response)
        if (!error.response) {
          throw new Error("Failed to analyze repository");
        }
      }

      if (error instanceof Error && error.message.includes("Invalid GitHub")) {
        throw error;
      }

      throw new Error("Failed to analyze repository");
    }
  }

  /**
   * Fetches the file tree from GitHub repository
   */
  private async fetchFileTree(
    owner: string,
    repo: string,
  ): Promise<GitHubTreeItem[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;

    const headers = this.buildHeaders();

    const response = await axios.get<{ tree: GitHubTreeItem[] }>(url, {
      headers,
    });

    return response.data.tree;
  }

  /**
   * Selects relevant files from the tree
   *
   * Priority:
   * 1. README files (README.md, README.txt, etc.)
   * 2. Configuration files (package.json, tsconfig.json, etc.)
   * 3. Source code files (src/, lib/, app/, etc.)
   * 4. Documentation files (docs/)
   *
   * Excludes:
   * - node_modules/, vendor/, .git/
   * - dist/, build/, out/
   * - Large files (>100KB)
   * - Binary files
   */
  private selectRelevantFiles(tree: GitHubTreeItem[]): GitHubTreeItem[] {
    const excluded = [
      "node_modules/",
      "vendor/",
      ".git/",
      "dist/",
      "build/",
      "out/",
      ".next/",
      "coverage/",
      ".cache/",
      "venv/",
      "__pycache__/",
    ];

    const priorityPatterns = [
      /^README/i,
      /^package\.json$/,
      /^tsconfig\.json$/,
      /^cargo\.toml$/i,
      /^go\.mod$/,
      /^requirements\.txt$/,
      /^Gemfile$/,
      /^pom\.xml$/,
      /^src\//,
      /^lib\//,
      /^app\//,
      /^api\//,
      /^docs\//,
    ];

    return tree
      .filter((item) => {
        // Only blobs (files)
        if (item.type !== "blob") return false;

        // Exclude large files
        if (item.size > MAX_FILE_SIZE) return false;

        // Exclude excluded directories
        if (excluded.some((ex) => item.path.startsWith(ex))) return false;

        // Exclude binary files by extension
        const binaryExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".ico",
          ".pdf",
          ".zip",
          ".tar",
          ".gz",
          ".exe",
          ".dll",
          ".so",
          ".dylib",
        ];
        if (
          binaryExtensions.some((ext) => item.path.toLowerCase().endsWith(ext))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Prioritize files matching priority patterns
        const aPriority = priorityPatterns.findIndex((pattern) =>
          pattern.test(a.path),
        );
        const bPriority = priorityPatterns.findIndex((pattern) =>
          pattern.test(b.path),
        );

        if (aPriority !== -1 && bPriority === -1) return -1;
        if (aPriority === -1 && bPriority !== -1) return 1;
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;

        // If neither matches priority, sort by size (smaller first)
        return a.size - b.size;
      })
      .slice(0, MAX_FILES); // Limit total files
  }

  /**
   * Fetches content of selected files
   */
  private async fetchFileContents(
    owner: string,
    repo: string,
    files: GitHubTreeItem[],
  ): Promise<RepositoryFile[]> {
    const headers = this.buildHeaders();

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const url = `${this.baseUrl}/repos/${owner}/${repo}/git/blobs/${file.sha}`;
          const response = await axios.get<{ content: string }>(url, {
            headers,
          });

          // GitHub returns base64-encoded content
          const content = Buffer.from(response.data.content, "base64").toString(
            "utf-8",
          );

          return {
            path: file.path,
            content,
          };
        } catch (error) {
          // If a single file fails, log and skip it
          console.error(`Failed to fetch file ${file.path}:`, error);
          return null;
        }
      }),
    );

    // Filter out failed fetches
    return results.filter(
      (result): result is RepositoryFile => result !== null,
    );
  }

  /**
   * Builds HTTP headers for GitHub API requests
   * Includes authentication token if available
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "User-Agent": "PivotApp",
    };

    // Add authentication if token is available (to avoid rate limiting)
    const token = process.env.GITHUB_ACCESS_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}
