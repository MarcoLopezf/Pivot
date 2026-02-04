import { describe, it, expect, vi } from "vitest";
import { OnboardingProgressMapper } from "@infrastructure/database/mappers/OnboardingProgressMapper";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";
import { type Prisma } from "@prisma/client";

describe("OnboardingProgressMapper", () => {
  describe("toDomain", () => {
    it("should convert Prisma OnboardingProgress to Domain OnboardingSession", () => {
      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 1, // Int instead of String
        path: null,
        completedSteps: [],
        partialData: { name: "John", age: 30 } as Prisma.JsonValue,
        createdAt: new Date("2024-01-01"),
        lastUpdatedAt: new Date("2024-01-01"),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

      expect(session.userId).toBe("user-123");
      expect(session.currentStep).toBe(1); // Converted from Int
      expect(session.data).toEqual({ name: "John", age: 30 });
      expect(session.updatedAt).toEqual(new Date("2024-01-01"));
    });

    it("should handle empty partialData object", () => {
      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 2,
        path: null,
        completedSteps: [],
        partialData: {} as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

      expect(session.data).toEqual({});
    });

    it("should handle null partialData by converting to empty object", () => {
      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 3,
        path: null,
        completedSteps: [],
        partialData: null as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

      expect(session.data).toEqual({});
    });

    it("should handle nested objects in partialData", () => {
      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 1,
        path: null,
        completedSteps: [],
        partialData: {
          profile: { name: "John", email: "john@example.com" },
          goals: { target: "Developer", current: "Student" },
        } as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

      expect(session.data).toEqual({
        profile: { name: "John", email: "john@example.com" },
        goals: { target: "Developer", current: "Student" },
      });
    });

    it("should handle array partialData by converting to empty object (unexpected type)", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 1,
        path: null,
        completedSteps: [],
        partialData: [1, 2, 3] as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

      expect(session.data).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Unexpected JsonValue type in OnboardingState:",
        "object",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle string partialData by converting to empty object (unexpected type)", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const prismaProgress = {
        id: "progress-123",
        userId: "user-123",
        currentStep: 1,
        path: null,
        completedSteps: [],
        partialData: "invalid string data" as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        abandonedAt: null,
      };

      const session = OnboardingProgressMapper.toDomain(prismaProgress);

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
      const session = OnboardingSession.create("user-123", 1, {
        name: "John",
        age: 30,
      });

      const persistence = OnboardingProgressMapper.toPersistence(session);

      expect(persistence.userId).toBe("user-123");
      expect(persistence.currentStep).toBe(1);
      expect(persistence.partialData).toEqual({ name: "John", age: 30 });
      expect(persistence.lastUpdatedAt).toBeInstanceOf(Date);
    });

    it("should convert empty data correctly", () => {
      const session = OnboardingSession.create("user-123", 2);

      const persistence = OnboardingProgressMapper.toPersistence(session);

      expect(persistence.partialData).toEqual({});
    });

    it("should convert nested data structures", () => {
      const complexData = {
        profile: { name: "John", email: "john@example.com" },
        goals: { target: "Developer", years: 2 },
        preferences: { theme: "dark", notifications: true },
      };

      const session = OnboardingSession.create("user-123", 3, complexData);

      const persistence = OnboardingProgressMapper.toPersistence(session);

      expect(persistence.partialData).toEqual(complexData);
    });

    it("should preserve lastUpdatedAt timestamp", () => {
      const specificDate = new Date("2024-01-15T10:30:00Z");
      const session = OnboardingSession.reconstitute(
        "user-123",
        1,
        { name: "John" },
        specificDate,
      );

      const persistence = OnboardingProgressMapper.toPersistence(session);

      expect(persistence.lastUpdatedAt).toEqual(specificDate);
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain data integrity through full conversion cycle", () => {
      const originalData = {
        profile: { name: "Jane Doe", email: "jane@example.com" },
        goals: { target: "Senior Developer", current: "Junior Developer" },
      };

      // Domain -> Persistence
      const session = OnboardingSession.create("user-456", 2, originalData);
      const persistence = OnboardingProgressMapper.toPersistence(session);

      // Persistence -> Domain
      const prismaProgress = {
        id: "progress-456",
        userId: persistence.userId,
        currentStep: persistence.currentStep,
        path: null,
        completedSteps: [],
        partialData: persistence.partialData as Prisma.JsonValue,
        createdAt: new Date(),
        lastUpdatedAt: persistence.lastUpdatedAt,
        abandonedAt: null,
      };
      const reconstructed = OnboardingProgressMapper.toDomain(prismaProgress);

      // Verify data integrity
      expect(reconstructed.userId).toBe("user-456");
      expect(reconstructed.currentStep).toBe(2);
      expect(reconstructed.data).toEqual(originalData);
    });
  });
});
