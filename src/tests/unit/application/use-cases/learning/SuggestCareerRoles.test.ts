import { describe, it, expect, vi, beforeEach } from "vitest";
import { SuggestCareerRoles } from "@application/use-cases/learning/SuggestCareerRoles";
import { IRoleRecommender } from "@domain/learning/services/IRoleRecommender";

describe("SuggestCareerRoles Use Case", () => {
  let mockRecommender: IRoleRecommender;
  let useCase: SuggestCareerRoles;

  beforeEach(() => {
    mockRecommender = { suggestRoles: vi.fn() };
    useCase = new SuggestCareerRoles(mockRecommender);
  });

  it("should return role suggestions mapped from recommender", async () => {
    vi.mocked(mockRecommender.suggestRoles).mockResolvedValue([
      {
        role: "Frontend Dev",
        matchPercentage: 90,
        reasoning: "Strong in React",
      },
      {
        role: "Full Stack Dev",
        matchPercentage: 75,
        reasoning: "Good overall",
      },
    ]);

    const result = await useCase.execute({ interests: "web development" });

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe("Frontend Dev");
    expect(result[0].matchPercentage).toBe(90);
    expect(result[1].role).toBe("Full Stack Dev");
  });

  it("should pass resume text to recommender when provided", async () => {
    vi.mocked(mockRecommender.suggestRoles).mockResolvedValue([]);

    await useCase.execute({ interests: "AI", resumeText: "5 years Python" });

    expect(mockRecommender.suggestRoles).toHaveBeenCalledWith(
      "AI",
      "5 years Python",
    );
  });

  it("should return empty array when no suggestions", async () => {
    vi.mocked(mockRecommender.suggestRoles).mockResolvedValue([]);

    const result = await useCase.execute({ interests: "unknown" });

    expect(result).toEqual([]);
  });
});
