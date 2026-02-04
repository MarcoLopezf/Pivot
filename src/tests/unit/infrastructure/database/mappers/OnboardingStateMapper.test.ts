import { describe, it, expect, vi } from "vitest";
import { OnboardingStateMapper } from "@infrastructure/database/mappers/OnboardingStateMapper";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { type Prisma } from "@prisma/client";

describe("OnboardingStateMapper", () => {
  describe("toDomain", () => {
    it("should convert Prisma OnboardingState to Domain OnboardingSession", () => {
      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "PROFILE",
        data: { name: "John", age: 30 } as Prisma.JsonValue,
        updatedAt: new Date("2024-01-01"),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.userId).toBe("user-123");
      expect(session.currentStep).toBe("PROFILE");
      expect(session.data).toEqual({ name: "John", age: 30 });
      expect(session.updatedAt).toEqual(new Date("2024-01-01"));
    });

    it("should handle empty data object", () => {
      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "GOALS",
        data: {} as Prisma.JsonValue,
        updatedAt: new Date(),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.data).toEqual({});
    });

    it("should handle null data by converting to empty object", () => {
      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "ROADMAP",
        data: null as Prisma.JsonValue,
        updatedAt: new Date(),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.data).toEqual({});
    });

    it("should handle nested objects in data", () => {
      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "PROFILE",
        data: {
          profile: { name: "John", email: "john@example.com" },
          goals: { target: "Developer", current: "Student" },
        } as Prisma.JsonValue,
        updatedAt: new Date(),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.data).toEqual({
        profile: { name: "John", email: "john@example.com" },
        goals: { target: "Developer", current: "Student" },
      });
    });

    it("should handle array data by converting to empty object (unexpected type)", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "PROFILE",
        data: [1, 2, 3] as Prisma.JsonValue,
        updatedAt: new Date(),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.data).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unexpected JsonValue type in OnboardingState:",
        "object",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle string data by converting to empty object (unexpected type)", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const prismaState = {
        id: "state-123",
        userId: "user-123",
        currentStep: "PROFILE",
        data: "invalid string data" as Prisma.JsonValue,
        updatedAt: new Date(),
      };

      const session = OnboardingStateMapper.toDomain(prismaState);

      expect(session.data).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unexpected JsonValue type in OnboardingState:",
        "string",
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("toPersistence", () => {
    it("should convert Domain OnboardingSession to Prisma format", () => {
      const session = OnboardingSession.create("user-123", "PROFILE", {
        name: "John",
        age: 30,
      });

      const persistence = OnboardingStateMapper.toPersistence(session);

      expect(persistence.userId).toBe("user-123");
      expect(persistence.currentStep).toBe("PROFILE");
      expect(persistence.data).toEqual({ name: "John", age: 30 });
      expect(persistence.updatedAt).toBeInstanceOf(Date);
    });

    it("should convert empty data correctly", () => {
      const session = OnboardingSession.create("user-123", "GOALS");

      const persistence = OnboardingStateMapper.toPersistence(session);

      expect(persistence.data).toEqual({});
    });

    it("should convert nested data structures", () => {
      const complexData = {
        profile: { name: "John", email: "john@example.com" },
        goals: { target: "Developer", years: 2 },
        preferences: { theme: "dark", notifications: true },
      };

      const session = OnboardingSession.create(
        "user-123",
        "ROADMAP",
        complexData,
      );

      const persistence = OnboardingStateMapper.toPersistence(session);

      expect(persistence.data).toEqual(complexData);
    });

    it("should preserve updatedAt timestamp", () => {
      const specificDate = new Date("2024-01-15T10:30:00Z");
      const session = OnboardingSession.reconstitute(
        "user-123",
        "PROFILE",
        { name: "John" },
        specificDate,
      );

      const persistence = OnboardingStateMapper.toPersistence(session);

      expect(persistence.updatedAt).toEqual(specificDate);
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data integrity through full conversion cycle", () => {
      const originalData = {
        profile: { name: "Jane Doe", email: "jane@example.com" },
        goals: { target: "Senior Developer", current: "Junior Developer" },
      };

      // Domain -> Persistence
      const session = OnboardingSession.create(
        "user-456",
        "GOALS",
        originalData,
      );
      const persistence = OnboardingStateMapper.toPersistence(session);

      // Persistence -> Domain
      const prismaState = {
        id: "state-456",
        userId: persistence.userId,
        currentStep: persistence.currentStep,
        data: persistence.data as Prisma.JsonValue, // Cast needed for test
        updatedAt: persistence.updatedAt,
      };
      const reconstructed = OnboardingStateMapper.toDomain(prismaState);

      // Verify data integrity
      expect(reconstructed.userId).toBe("user-456");
      expect(reconstructed.currentStep).toBe("GOALS");
      expect(reconstructed.data).toEqual(originalData);
    });
  });
});
