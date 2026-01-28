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
});
