import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { SetCareerGoal } from "@application/use-cases/learning/SetCareerGoal";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";

describe("SetCareerGoal Use Case", () => {
  let mockRepository: ICareerGoalRepository;
  let useCase: SetCareerGoal;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
    };

    useCase = new SetCareerGoal(mockRepository);
  });

  describe("execute", () => {
    it("should create and save a career goal successfully", async () => {
      const dto = {
        userId: "user-001",
        targetRole: "Senior Backend Engineer",
        currentRole: "Junior Backend Engineer",
      };

      const result = await useCase.execute(dto);

      // Verify the result DTO
      expect(result).toMatchObject({
        userId: "user-001",
        targetRole: "Senior Backend Engineer",
        currentRole: "Junior Backend Engineer",
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify repository.save was called once
      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      // Verify save was called with a CareerGoal entity
      const saveMock = mockRepository.save as Mock;
      const savedGoal = saveMock.mock.calls[0][0] as CareerGoal;
      expect(savedGoal).toBeInstanceOf(CareerGoal);
      expect(savedGoal.targetRole).toBe("Senior Backend Engineer");
      expect(savedGoal.currentRole).toBe("Junior Backend Engineer");
    });

    it("should throw error when target role is empty", async () => {
      const dto = {
        userId: "user-001",
        targetRole: "",
        currentRole: "Junior Backend Engineer",
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Target role cannot be empty",
      );

      // Verify repository.save was NOT called
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error when current role is empty", async () => {
      const dto = {
        userId: "user-001",
        targetRole: "Senior Backend Engineer",
        currentRole: "",
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        "Current role cannot be empty",
      );

      // Verify repository.save was NOT called
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should throw error when userId is empty", async () => {
      const dto = {
        userId: "",
        targetRole: "Senior Backend Engineer",
        currentRole: "Junior Backend Engineer",
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        "UserId cannot be empty",
      );

      // Verify repository.save was NOT called
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
