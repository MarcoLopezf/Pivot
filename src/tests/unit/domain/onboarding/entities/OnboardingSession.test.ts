import { describe, it, expect } from "vitest";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

describe("OnboardingSession", () => {
  describe("create", () => {
    it("should create an onboarding session with valid userId and currentStep", () => {
      const session = OnboardingSession.create("user-123", 1);

      expect(session.userId).toBe("user-123");
      expect(session.currentStep).toBe(1);
      expect(session.data).toEqual({});
    });

    it("should create with initial data", () => {
      const initialData = { name: "John", email: "john@example.com" };
      const session = OnboardingSession.create("user-123", 1, initialData);

      expect(session.data).toEqual(initialData);
    });

    it("should record creation timestamp", () => {
      const before = new Date();
      const session = OnboardingSession.create("user-123", 1);
      const after = new Date();

      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(session.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should reject empty userId", () => {
      expect(() => OnboardingSession.create("", 1)).toThrow(
        "User ID cannot be empty",
      );
    });

    it("should reject whitespace-only userId", () => {
      expect(() => OnboardingSession.create("   ", 1)).toThrow(
        "User ID cannot be empty",
      );
    });

    it("should reject step less than 1", () => {
      expect(() => OnboardingSession.create("user-123", 0)).toThrow(
        "Current step must be at least 1",
      );
    });

    it("should reject negative step", () => {
      expect(() => OnboardingSession.create("user-123", -1)).toThrow(
        "Current step must be at least 1",
      );
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute a session from persistence data", () => {
      const updatedAt = new Date("2024-01-01");
      const data = { profile: { name: "John" } };

      const session = OnboardingSession.reconstitute(
        "user-123",
        2,
        data,
        updatedAt,
      );

      expect(session.userId).toBe("user-123");
      expect(session.currentStep).toBe(2);
      expect(session.data).toEqual(data);
      expect(session.updatedAt).toBe(updatedAt);
    });
  });

  describe("updateStep", () => {
    it("should update the current step", () => {
      const session = OnboardingSession.create("user-123", 1);

      session.updateStep(2);

      expect(session.currentStep).toBe(2);
    });

    it("should update the updatedAt timestamp when step changes", () => {
      const session = OnboardingSession.create("user-123", 1);

      // Small delay to ensure timestamp difference
      const before = new Date();
      session.updateStep(2);
      const after = new Date();

      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(session.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should reject step less than 1", () => {
      const session = OnboardingSession.create("user-123", 1);

      expect(() => session.updateStep(0)).toThrow("Step must be at least 1");
    });

    it("should reject negative step", () => {
      const session = OnboardingSession.create("user-123", 1);

      expect(() => session.updateStep(-1)).toThrow("Step must be at least 1");
    });
  });

  describe("updateData", () => {
    it("should merge new data with existing data", () => {
      const session = OnboardingSession.create("user-123", 1, {
        name: "John",
        age: 30,
      });

      session.updateData({ age: 31, city: "NYC" });

      expect(session.data).toEqual({
        name: "John",
        age: 31,
        city: "NYC",
      });
    });

    it("should handle updating empty data", () => {
      const session = OnboardingSession.create("user-123", 1);

      session.updateData({ name: "John" });

      expect(session.data).toEqual({ name: "John" });
    });

    it("should update the updatedAt timestamp", () => {
      const session = OnboardingSession.create("user-123", 1);

      const before = new Date();
      session.updateData({ name: "John" });
      const after = new Date();

      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(session.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("setData", () => {
    it("should replace all data", () => {
      const session = OnboardingSession.create("user-123", 1, {
        name: "John",
        age: 30,
      });

      session.setData({ city: "NYC" });

      expect(session.data).toEqual({ city: "NYC" });
    });

    it("should update the updatedAt timestamp", () => {
      const session = OnboardingSession.create("user-123", 1);

      const before = new Date();
      session.setData({ name: "John" });
      const after = new Date();

      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(session.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("clearData", () => {
    it("should clear all data", () => {
      const session = OnboardingSession.create("user-123", 1, {
        name: "John",
        age: 30,
      });

      session.clearData();

      expect(session.data).toEqual({});
    });

    it("should update the updatedAt timestamp", () => {
      const session = OnboardingSession.create("user-123", 1);

      const before = new Date();
      session.clearData();
      const after = new Date();

      expect(session.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(session.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("data immutability", () => {
    it("should return a copy of data to prevent external mutation", () => {
      const session = OnboardingSession.create("user-123", 1, {
        name: "John",
      });

      const data = session.data;
      data.name = "Jane";

      // Original data should remain unchanged
      expect(session.data.name).toBe("John");
    });
  });
});
