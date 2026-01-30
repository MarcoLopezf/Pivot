import axios, { AxiosError } from "axios";

/**
 * GitHubService - Infrastructure service for GitHub API integration
 *
 * Provides functionality to analyze a user's public GitHub profile
 * and extract technical context from their repositories.
 *
 * Infrastructure Layer - Implements external dependency (axios)
 */
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
}
