import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@infrastructure/database/PrismaClient";
import { PrismaOnboardingRepository } from "@infrastructure/database/repositories/PrismaOnboardingRepository";
import { OnboardingSession } from "@domain/onboarding/entities/OnboardingSession";

const hasTestDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasTestDb)(
  "PrismaOnboardingRepository (integration) — requires DATABASE_URL",
  () => {
    let repository: PrismaOnboardingRepository;

    beforeEach(async () => {
      repository = new PrismaOnboardingRepository(prisma);

      // Clean up test data before each test
      await prisma.onboardingProgress.deleteMany({
        where: {
          userId: {
            in: [
              "test-onboarding-user-001",
              "test-onboarding-user-002",
              "test-onboarding-user-003",
              "non-existent-user",
            ],
          },
        },
      });

      // Also clean up any test users that might exist
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [
              "test-onboarding-user-001",
              "test-onboarding-user-002",
              "test-onboarding-user-003",
            ],
          },
        },
      });

      // Create test users for onboarding states
      await prisma.user.createMany({
        data: [
          {
            id: "test-onboarding-user-001",
            email: "onboarding1@example.com",
            name: "Test User 1",
          },
          {
            id: "test-onboarding-user-002",
            email: "onboarding2@example.com",
            name: "Test User 2",
          },
          {
            id: "test-onboarding-user-003",
            email: "onboarding3@example.com",
            name: "Test User 3",
          },
        ],
      });
    });

    it("should save a new onboarding session", async () => {
      const session = OnboardingSession.create("test-onboarding-user-001", 1, {
        name: "John Doe",
        email: "john@example.com",
      });

      await repository.save(session);

      const found = await repository.findByUserId("test-onboarding-user-001");

      expect(found).not.toBeNull();
      expect(found!.userId).toBe("test-onboarding-user-001");
      expect(found!.currentStep).toBe(1);
      expect(found!.data).toEqual({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should update an existing onboarding session (upsert)", async () => {
      // Create initial session
      const initialSession = OnboardingSession.create(
        "test-onboarding-user-002",
        1,
        { name: "Jane" },
      );
      await repository.save(initialSession);

      // Update with new data
      const updatedSession = OnboardingSession.create(
        "test-onboarding-user-002",
        2,
        { name: "Jane", targetRole: "Developer" },
      );
      await repository.save(updatedSession);

      // Verify update
      const found = await repository.findByUserId("test-onboarding-user-002");

      expect(found).not.toBeNull();
      expect(found!.currentStep).toBe(2);
      expect(found!.data).toEqual({ name: "Jane", targetRole: "Developer" });
    });

    it("should find onboarding session by userId", async () => {
      const session = OnboardingSession.create("test-onboarding-user-003", 3, {
        skills: ["TypeScript", "React"],
      });

      await repository.save(session);

      const found = await repository.findByUserId("test-onboarding-user-003");

      expect(found).not.toBeNull();
      expect(found!.userId).toBe("test-onboarding-user-003");
      expect(found!.currentStep).toBe(3);
      expect(found!.data).toEqual({ skills: ["TypeScript", "React"] });
    });

    it("should return null when onboarding session is not found", async () => {
      const found = await repository.findByUserId("non-existent-user");

      expect(found).toBeNull();
    });

    it("should delete an onboarding session", async () => {
      // Create session
      const session = OnboardingSession.create("test-onboarding-user-001", 1, {
        name: "To Delete",
      });
      await repository.save(session);

      // Verify it exists
      let found = await repository.findByUserId("test-onboarding-user-001");
      expect(found).not.toBeNull();

      // Delete it
      await repository.delete("test-onboarding-user-001");

      // Verify it's gone
      found = await repository.findByUserId("test-onboarding-user-001");
      expect(found).toBeNull();
    });

    it("should handle complex nested data structures", async () => {
      const complexData = {
        profile: {
          name: "John Doe",
          email: "john@example.com",
          skills: ["JavaScript", "TypeScript", "React"],
        },
        goals: {
          target: "Senior Developer",
          current: "Junior Developer",
          yearsExperience: 2,
        },
        preferences: {
          theme: "dark",
          notifications: true,
          languages: ["en", "es"],
        },
      };

      const session = OnboardingSession.create(
        "test-onboarding-user-002",
        5,
        complexData,
      );

      await repository.save(session);

      const found = await repository.findByUserId("test-onboarding-user-002");

      expect(found).not.toBeNull();
      expect(found!.data).toEqual(complexData);
    });

    it("should handle empty data object", async () => {
      const session = OnboardingSession.create("test-onboarding-user-003", 1);

      await repository.save(session);

      const found = await repository.findByUserId("test-onboarding-user-003");

      expect(found).not.toBeNull();
      expect(found!.data).toEqual({});
    });

    it("should preserve updatedAt timestamp through save and retrieve", async () => {
      const session = OnboardingSession.create("test-onboarding-user-001", 2, {
        target: "Developer",
      });

      const beforeSave = session.updatedAt;
      await repository.save(session);

      const found = await repository.findByUserId("test-onboarding-user-001");

      expect(found).not.toBeNull();
      // UpdatedAt might be slightly different due to DB roundtrip, but should be close
      expect(found!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime() - 1000,
      );
      expect(found!.updatedAt.getTime()).toBeLessThanOrEqual(
        beforeSave.getTime() + 1000,
      );
    });
  },
);
