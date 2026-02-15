import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("node:crypto", () => ({
  randomUUID: vi.fn(() => "mock-goal-uuid"),
}));

import { CompleteOnboarding } from "@application/use-cases/onboarding/CompleteOnboarding";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { GenerateUserRoadmap } from "@application/use-cases/learning/GenerateUserRoadmap";
import { User } from "@domain/profile/entities/User";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Email } from "@domain/profile/value-objects/Email";
import { UserRole } from "@domain/profile/entities/UserRole";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import type { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

const mockRoadmapDTO: RoadmapDTO = {
  id: "roadmap-1",
  goalId: "goal-1",
  title: "Test Roadmap",
  progress: 0,
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CompleteOnboarding Use Case", () => {
  let mockUserRepo: IUserRepository;
  let mockOnboardingRepo: IOnboardingRepository;
  let mockGoalRepo: ICareerGoalRepository;
  let mockGenerateRoadmap: GenerateUserRoadmap;
  let useCase: CompleteOnboarding;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    mockUserRepo = { save: vi.fn(), findByEmail: vi.fn(), findById: vi.fn() };
    mockOnboardingRepo = {
      save: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    mockGoalRepo = { save: vi.fn(), findById: vi.fn(), findByUserId: vi.fn() };
    mockGenerateRoadmap = {
      execute: vi.fn(),
    } as unknown as GenerateUserRoadmap;
    useCase = new CompleteOnboarding(
      mockUserRepo,
      mockOnboardingRepo,
      mockGoalRepo,
      mockGenerateRoadmap,
    );
  });

  it("should throw when user not found", async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("user-1")).rejects.toThrow("User not found");
  });

  it("should create a new roadmap for returning users who already completed onboarding", async () => {
    const user = User.reconstitute(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
      UserRole.USER,
      new Date(),
      new Date(),
      true,
      new Date(),
      "NYC",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

    const session = OnboardingSession.create("user-1", 5, {
      targetRole: "Data Engineer",
      currentRole: "Backend Dev",
      yearsExperience: 4,
      region: "Buenos Aires",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    const roadmapId = await useCase.execute("user-1");

    // Should still create goal and roadmap
    expect(mockGoalRepo.save).toHaveBeenCalledTimes(1);
    expect(mockGenerateRoadmap.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        currentRole: "Backend Dev",
        targetRole: "Data Engineer",
      }),
    );
    expect(mockOnboardingRepo.delete).toHaveBeenCalledWith("user-1");
    expect(roadmapId).toBe("roadmap-1");

    // Should NOT re-set onboardingCompleted (already true)
    expect(user.onboardingCompleted).toBe(true);

    // Should update experience/seniority fields
    expect(user.location).toBe("Buenos Aires");
    expect(user.yearsExperience).toBe(4);
    expect(user.currentSeniority).toBe("MID");
    expect(user.isEntryLevel).toBe(false);
  });

  it("should throw when onboarding session not found", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(null);

    await expect(useCase.execute("user-1")).rejects.toThrow(
      "Onboarding session not found",
    );
  });

  it("should complete onboarding with full data", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);

    const session = OnboardingSession.create("user-1", 5, {
      targetRole: "Senior Dev",
      currentRole: "Junior Dev",
      yearsExperience: 3,
      region: "Mexico City",
      interests: "AI, Web",
      dislike: "Legacy code",
      resumeText: "5 years exp",
      githubUsername: "johndoe",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    const roadmapId = await useCase.execute("user-1");

    expect(roadmapId).toBe("roadmap-1");
    expect(user.onboardingCompleted).toBe(true);
    expect(user.location).toBe("Mexico City");
    expect(user.yearsExperience).toBe(3);
    expect(user.currentSeniority).toBe("MID");
    expect(mockGoalRepo.save).toHaveBeenCalledTimes(1);
    expect(mockGenerateRoadmap.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        currentRole: "Junior Dev",
        targetRole: "Senior Dev",
        cvText: "5 years exp",
        githubUsername: "johndoe",
      }),
    );
    expect(mockOnboardingRepo.delete).toHaveBeenCalledWith("user-1");
  });

  it("should determine seniority correctly", async () => {
    const testCases = [
      { years: 0, expected: null },
      { years: 1, expected: "JUNIOR" },
      { years: 2, expected: "JUNIOR" },
      { years: 3, expected: "MID" },
      { years: 6, expected: "MID" },
      { years: 7, expected: "SENIOR" },
      { years: 15, expected: "SENIOR" },
    ];

    for (const { years, expected } of testCases) {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("u@e.com"),
        "John",
      );
      vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
      const session = OnboardingSession.create("user-1", 5, {
        yearsExperience: years,
        targetRole: "Dev",
        currentRole: "Dev",
      });
      vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
      vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
      vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
      vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
      vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

      await useCase.execute("user-1");

      expect(user.currentSeniority).toBe(expected);
    }
  });

  it("should handle string yearsExperience via validateNumber", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    const session = OnboardingSession.create("user-1", 5, {
      yearsExperience: "5",
      targetRole: "Dev",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    await useCase.execute("user-1");

    expect(user.yearsExperience).toBe(5);
    expect(user.currentSeniority).toBe("MID");
  });

  it("should default yearsExperience to 0 for invalid values", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    const session = OnboardingSession.create("user-1", 5, {
      yearsExperience: "not a number",
      targetRole: "Dev",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    await useCase.execute("user-1");

    expect(user.yearsExperience).toBe(0);
    expect(user.isEntryLevel).toBe(true);
  });

  it("should build experience summary from session data", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    const session = OnboardingSession.create("user-1", 5, {
      currentRole: "Frontend Dev",
      yearsExperience: 0,
      interests: "AI",
      dislike: "Testing",
      targetRole: "Dev",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    await useCase.execute("user-1");

    const call = vi.mocked(mockGenerateRoadmap.execute).mock.calls[0][0];
    expect(call.experienceSummary).toContain("Current role: Frontend Dev");
    expect(call.experienceSummary).toContain("Just starting out in tech");
    expect(call.experienceSummary).toContain("Interests: AI");
    expect(call.experienceSummary).toContain("Prefers to avoid: Testing");
  });

  it("should handle missing optional fields gracefully", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    const session = OnboardingSession.create("user-1", 5, {});
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGoalRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockGenerateRoadmap.execute).mockResolvedValue(mockRoadmapDTO);
    vi.mocked(mockOnboardingRepo.delete).mockResolvedValue(undefined);

    await useCase.execute("user-1");

    const call = vi.mocked(mockGenerateRoadmap.execute).mock.calls[0][0];
    expect(call.targetRole).toBe("Software Developer"); // default
    expect(call.currentRole).toBe("Beginner"); // default
    expect(call.cvText).toBeUndefined();
    expect(call.githubUsername).toBeUndefined();
  });
});
