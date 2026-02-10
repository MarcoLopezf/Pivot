import { describe, it, expect } from "vitest";
import { User } from "@domain/profile/entities/User";
import { Email } from "@domain/profile/value-objects/Email";
import { UserId } from "@domain/profile/value-objects/UserId";
import { UserRole } from "@domain/profile/entities/UserRole";

describe("User", () => {
  describe("create", () => {
    it("should create a user with valid id, email and name", () => {
      const id = UserId.create("user-1");
      const email = Email.create("user@example.com");

      const user = User.create(id, email, "John Doe");

      expect(user.id.value).toBe("user-1");
      expect(user.email.value).toBe("user@example.com");
      expect(user.name).toBe("John Doe");
    });

    it("should initialize with default role USER", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      expect(user.role).toBe(UserRole.USER);
    });

    it("should record creation date", () => {
      const before = new Date();
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should set updatedAt equal to createdAt on creation", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      expect(user.updatedAt.getTime()).toBe(user.createdAt.getTime());
    });

    it("should reject empty name", () => {
      expect(() =>
        User.create(
          UserId.create("user-1"),
          Email.create("user@example.com"),
          "",
        ),
      ).toThrow();
    });

    it("should reject whitespace-only name", () => {
      expect(() =>
        User.create(
          UserId.create("user-1"),
          Email.create("user@example.com"),
          "   ",
        ),
      ).toThrow();
    });
  });

  describe("updateName", () => {
    it("should update the name", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.updateName("Jane Doe");

      expect(user.name).toBe("Jane Doe");
    });

    it("should update updatedAt when name changes", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      const createdAt = user.createdAt;
      user.updateName("Jane Doe");

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        createdAt.getTime(),
      );
    });

    it("should reject empty name on update", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      expect(() => user.updateName("")).toThrow();
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a user with all onboarding fields", () => {
      const id = UserId.create("user-1");
      const email = Email.create("user@example.com");
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-06-01");

      const user = User.reconstitute(
        id,
        email,
        "John Doe",
        UserRole.USER,
        createdAt,
        updatedAt,
        true,
        new Date("2024-03-01"),
        "Mexico City",
        "Developer",
        false,
        "mid",
        3,
      );

      expect(user.onboardingCompleted).toBe(true);
      expect(user.onboardingCompletedAt).toEqual(new Date("2024-03-01"));
      expect(user.location).toBe("Mexico City");
      expect(user.bio).toBe("Developer");
      expect(user.isEntryLevel).toBe(false);
      expect(user.currentSeniority).toBe("mid");
      expect(user.yearsExperience).toBe(3);
      expect(user.updatedAt).toEqual(updatedAt);
    });
  });

  describe("updateProfile", () => {
    it("should update name, location, and bio", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.updateProfile("Jane Doe", "Mexico City", "Software Engineer");

      expect(user.name).toBe("Jane Doe");
      expect(user.location).toBe("Mexico City");
      expect(user.bio).toBe("Software Engineer");
    });

    it("should not update name when empty string is provided", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.updateProfile("", "Mexico City", null);

      expect(user.name).toBe("John Doe");
      expect(user.location).toBe("Mexico City");
    });

    it("should allow null location and bio", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.updateProfile("John Doe", null, null);

      expect(user.location).toBeNull();
      expect(user.bio).toBeNull();
    });

    it("should update updatedAt", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );
      const before = user.updatedAt;

      user.updateProfile("Jane", "NYC", "Dev");

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe("completeOnboarding", () => {
    it("should mark onboarding as completed with profile data", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.completeOnboarding("Mexico City", false, 5, "senior");

      expect(user.onboardingCompleted).toBe(true);
      expect(user.onboardingCompletedAt).toBeInstanceOf(Date);
      expect(user.location).toBe("Mexico City");
      expect(user.isEntryLevel).toBe(false);
      expect(user.yearsExperience).toBe(5);
      expect(user.currentSeniority).toBe("senior");
    });

    it("should handle entry-level user with null seniority", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );

      user.completeOnboarding(null, true, 0, null);

      expect(user.onboardingCompleted).toBe(true);
      expect(user.location).toBeNull();
      expect(user.isEntryLevel).toBe(true);
      expect(user.yearsExperience).toBe(0);
      expect(user.currentSeniority).toBeNull();
    });

    it("should update updatedAt", () => {
      const user = User.create(
        UserId.create("user-1"),
        Email.create("user@example.com"),
        "John Doe",
      );
      const before = user.updatedAt;

      user.completeOnboarding("NYC", false, 3, "mid");

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });
});
