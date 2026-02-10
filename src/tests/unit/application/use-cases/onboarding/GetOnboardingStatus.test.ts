import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetOnboardingStatus } from "@application/use-cases/onboarding/GetOnboardingStatus";
import { IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { User } from "@domain/profile/entities/User";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Email } from "@domain/profile/value-objects/Email";
import { UserRole } from "@domain/profile/entities/UserRole";

describe("GetOnboardingStatus Use Case", () => {
  let mockOnboardingRepo: IOnboardingRepository;
  let mockUserRepo: IUserRepository;
  let useCase: GetOnboardingStatus;

  beforeEach(() => {
    mockOnboardingRepo = {
      save: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    mockUserRepo = { save: vi.fn(), findByEmail: vi.fn(), findById: vi.fn() };
    useCase = new GetOnboardingStatus(mockOnboardingRepo, mockUserRepo);
  });

  it("should throw when userId is empty", async () => {
    await expect(useCase.execute("")).rejects.toThrow("User ID is required");
  });

  it("should return existing session when found", async () => {
    const session = OnboardingSession.create("user-1", 3, {
      targetRole: "Dev",
    });
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(session);

    const result = await useCase.execute("user-1");

    expect(result).toBe(session);
    expect(mockUserRepo.findById).not.toHaveBeenCalled();
  });

  it("should return null when no session and no user", async () => {
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(null);
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute("user-1");

    expect(result).toBeNull();
  });

  it("should create session at step 2 when profile is complete", async () => {
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(null);
    const user = User.reconstitute(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
      UserRole.USER,
      new Date(),
      new Date(),
      false,
      null,
      "Mexico City",
      "Dev bio",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute("user-1");

    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe(2);
    expect(result!.data.name).toBe("John");
    expect(result!.data.region).toBe("Mexico City");
    expect(result!.data.bio).toBe("Dev bio");
    expect(mockOnboardingRepo.save).toHaveBeenCalledTimes(1);
  });

  it("should create session at step 1 when profile is incomplete", async () => {
    vi.mocked(mockOnboardingRepo.findByUserId).mockResolvedValue(null);
    const user = User.reconstitute(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
      UserRole.USER,
      new Date(),
      new Date(),
      false,
      null,
      null, // no location = incomplete
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute("user-1");

    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe(1);
    expect(result!.data.name).toBe("John");
  });
});
