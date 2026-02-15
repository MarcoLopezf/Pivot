import { describe, it, expect, vi, beforeEach } from "vitest";
import { SaveOnboardingStep } from "@application/use-cases/onboarding/SaveOnboardingStep";
import { IOnboardingRepository } from "@domain/onboarding/repositories/IOnboardingRepository";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { User } from "@domain/profile/entities/User";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Email } from "@domain/profile/value-objects/Email";

describe("SaveOnboardingStep Use Case", () => {
  let mockOnboardingRepo: IOnboardingRepository;
  let mockUserRepo: IUserRepository;
  let useCase: SaveOnboardingStep;

  beforeEach(() => {
    mockOnboardingRepo = {
      save: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    mockUserRepo = { save: vi.fn(), findByEmail: vi.fn(), findById: vi.fn() };
    useCase = new SaveOnboardingStep(mockOnboardingRepo, mockUserRepo);
  });

  it("should throw when userId is empty", async () => {
    await expect(useCase.execute("", 1, {})).rejects.toThrow(
      "User ID is required",
    );
  });

  it("should throw when step < 1", async () => {
    await expect(useCase.execute("user-1", 0, {})).rejects.toThrow(
      "Step must be between 1 and 6",
    );
  });

  it("should throw when step > 6", async () => {
    await expect(useCase.execute("user-1", 7, {})).rejects.toThrow(
      "Step must be between 1 and 6",
    );
  });

  it("should save onboarding session for step 2+", async () => {
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    await useCase.execute("user-1", 2, { targetRole: "Dev" });

    expect(mockOnboardingRepo.save).toHaveBeenCalledTimes(1);
    expect(mockUserRepo.findById).not.toHaveBeenCalled();
  });

  it("should persist profile data on step 1", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    await useCase.execute("user-1", 1, {
      name: "Jane",
      region: "NYC",
      bio: "Dev",
    });

    expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    expect(user.name).toBe("Jane");
    expect(user.location).toBe("NYC");
    expect(user.bio).toBe("Dev");
  });

  it("should not fail when user not found on step 1", async () => {
    vi.mocked(mockUserRepo.findById).mockResolvedValue(null);
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    await expect(
      useCase.execute("user-1", 1, { name: "Jane" }),
    ).resolves.not.toThrow();
  });

  it("should keep existing name when step 1 data has no name", async () => {
    const user = User.create(
      UserId.create("user-1"),
      Email.create("u@e.com"),
      "John",
    );
    vi.mocked(mockUserRepo.findById).mockResolvedValue(user);
    vi.mocked(mockUserRepo.save).mockResolvedValue(undefined);
    vi.mocked(mockOnboardingRepo.save).mockResolvedValue(undefined);

    await useCase.execute("user-1", 1, {});

    expect(user.name).toBe("John");
  });
});
