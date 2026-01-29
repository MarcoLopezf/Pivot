import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserDashboard } from "@application/use-cases/dashboard/GetUserDashboard";
import { IUserRepository } from "@domain/profile/repositories/IUserRepository";
import { ICareerGoalRepository } from "@domain/learning/repositories/ICareerGoalRepository";
import { IRoadmapRepository } from "@domain/learning/repositories/IRoadmapRepository";
import { User } from "@domain/profile/entities/User";
import { CareerGoal } from "@domain/learning/entities/CareerGoal";
import { Roadmap } from "@domain/learning/entities/Roadmap";
import { RoadmapItem } from "@domain/learning/entities/RoadmapItem";
import { UserId } from "@domain/profile/value-objects/UserId";
import { Email } from "@domain/profile/value-objects/Email";
import { CareerGoalId } from "@domain/learning/value-objects/CareerGoalId";
import { RoadmapId } from "@domain/learning/value-objects/RoadmapId";
import { RoadmapItemId } from "@domain/learning/value-objects/RoadmapItemId";

describe("GetUserDashboard Use Case", () => {
  let mockUserRepository: IUserRepository;
  let mockCareerGoalRepository: ICareerGoalRepository;
  let mockRoadmapRepository: IRoadmapRepository;
  let useCase: GetUserDashboard;

  beforeEach(() => {
    mockUserRepository = {
      save: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    mockCareerGoalRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
    };

    mockRoadmapRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByGoalId: vi.fn(),
      findLatestByUserId: vi.fn(),
    };

    useCase = new GetUserDashboard(
      mockUserRepository,
      mockCareerGoalRepository,
      mockRoadmapRepository,
    );
  });

  describe("Happy Path - User with Goal and Roadmap", () => {
    it("should return complete dashboard data when user has goal and roadmap", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "John Doe",
      );

      const careerGoal = CareerGoal.create(
        CareerGoalId.create("goal-001"),
        UserId.create("user-001"),
        "Senior Software Engineer",
        "Junior Developer",
      );

      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-001"),
        CareerGoalId.create("goal-001"),
        "Path to Senior Engineer",
      );

      const item1 = RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "Learn TypeScript",
        "Study TS fundamentals",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("item-002"),
        "Learn React",
        "Study React hooks",
        2,
      );

      item1.markCompleted();

      roadmap.addItem(item1);
      roadmap.addItem(item2);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([
        careerGoal,
      ]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        roadmap,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.userName).toBe("John Doe");
      expect(result!.careerGoal).toBe("Senior Software Engineer");
      expect(result!.totalTasks).toBe(2);
      expect(result!.completedTasks).toBe(1);
      expect(result!.progress).toBe(50);
      expect(result!.nextTask).not.toBeNull();
      expect(result!.nextTask!.id).toBe("item-002");
      expect(result!.nextTask!.title).toBe("Learn React");
      expect(result!.nextTask!.status).toBe("pending");
    });

    it("should return in_progress task as next task when available", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "Jane Smith",
      );

      const careerGoal = CareerGoal.create(
        CareerGoalId.create("goal-001"),
        UserId.create("user-001"),
        "Tech Lead",
        "Mid-level Engineer",
      );

      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-001"),
        CareerGoalId.create("goal-001"),
        "Path to Tech Lead",
      );

      const item1 = RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "System Design",
        "Learn system design patterns",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("item-002"),
        "Leadership",
        "Develop leadership skills",
        2,
      );

      item1.markInProgress();

      roadmap.addItem(item1);
      roadmap.addItem(item2);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([
        careerGoal,
      ]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        roadmap,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result!.nextTask).not.toBeNull();
      expect(result!.nextTask!.id).toBe("item-001");
      expect(result!.nextTask!.status).toBe("in_progress");
    });

    it("should calculate 100% progress when all tasks completed", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "Bob Johnson",
      );

      const careerGoal = CareerGoal.create(
        CareerGoalId.create("goal-001"),
        UserId.create("user-001"),
        "Full Stack Developer",
        "Backend Developer",
      );

      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-001"),
        CareerGoalId.create("goal-001"),
        "Full Stack Path",
      );

      const item1 = RoadmapItem.create(
        RoadmapItemId.create("item-001"),
        "Frontend",
        "Learn frontend",
        1,
      );
      const item2 = RoadmapItem.create(
        RoadmapItemId.create("item-002"),
        "DevOps",
        "Learn DevOps",
        2,
      );

      item1.markCompleted();
      item2.markCompleted();

      roadmap.addItem(item1);
      roadmap.addItem(item2);

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([
        careerGoal,
      ]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        roadmap,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result!.progress).toBe(100);
      expect(result!.completedTasks).toBe(2);
      expect(result!.totalTasks).toBe(2);
      expect(result!.nextTask).toBeNull();
    });
  });

  describe("Edge Cases - User without Goal or Roadmap", () => {
    it("should return dashboard with null goal when user has no career goal", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "New User",
      );

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        null,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.userName).toBe("New User");
      expect(result!.careerGoal).toBeNull();
      expect(result!.totalTasks).toBe(0);
      expect(result!.completedTasks).toBe(0);
      expect(result!.progress).toBe(0);
      expect(result!.nextTask).toBeNull();
    });

    it("should return dashboard with goal but no roadmap", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "User With Goal",
      );

      const careerGoal = CareerGoal.create(
        CareerGoalId.create("goal-001"),
        UserId.create("user-001"),
        "Data Scientist",
        "Data Analyst",
      );

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([
        careerGoal,
      ]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        null,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.userName).toBe("User With Goal");
      expect(result!.careerGoal).toBe("Data Scientist");
      expect(result!.totalTasks).toBe(0);
      expect(result!.completedTasks).toBe(0);
      expect(result!.progress).toBe(0);
      expect(result!.nextTask).toBeNull();
    });

    it("should throw error when user not found", async () => {
      // Arrange
      vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute("non-existent-user")).rejects.toThrow(
        "User not found",
      );
    });

    it("should throw error when userId is empty", async () => {
      // Act & Assert
      await expect(useCase.execute("")).rejects.toThrow();
    });
  });

  describe("Multiple Goals - Latest Goal Selection", () => {
    it("should use the latest career goal when user has multiple goals", async () => {
      // Arrange
      const user = User.create(
        UserId.create("user-001"),
        Email.create("test@example.com"),
        "Multi Goal User",
      );

      const olderGoal = CareerGoal.reconstitute(
        CareerGoalId.create("goal-001"),
        UserId.create("user-001"),
        "Backend Engineer",
        "Junior Dev",
        new Date("2024-01-01"),
        new Date("2024-01-01"),
      );

      const newerGoal = CareerGoal.reconstitute(
        CareerGoalId.create("goal-002"),
        UserId.create("user-001"),
        "Frontend Engineer",
        "Junior Dev",
        new Date("2024-06-01"),
        new Date("2024-06-01"),
      );

      const roadmap = Roadmap.create(
        RoadmapId.create("roadmap-001"),
        CareerGoalId.create("goal-002"),
        "Frontend Path",
      );

      vi.mocked(mockUserRepository.findById).mockResolvedValue(user);
      vi.mocked(mockCareerGoalRepository.findByUserId).mockResolvedValue([
        olderGoal,
        newerGoal,
      ]);
      vi.mocked(mockRoadmapRepository.findLatestByUserId).mockResolvedValue(
        roadmap,
      );

      // Act
      const result = await useCase.execute("user-001");

      // Assert
      expect(result!.careerGoal).toBe("Frontend Engineer");
    });
  });
});
