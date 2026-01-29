import { RoadmapItemDTO } from "@application/dtos/learning/RoadmapDTO";

/**
 * DashboardDTO - Data Transfer Object for Dashboard aggregated view
 *
 * Aggregates User, CareerGoal, and Roadmap data for the dashboard page.
 */
export interface DashboardDTO {
  /**
   * User's full name
   */
  userName: string;

  /**
   * Target career role (null if user hasn't set a goal yet)
   */
  careerGoal: string | null;

  /**
   * Overall progress percentage (0-100)
   * Calculated as: (completedTasks / totalTasks) * 100
   */
  progress: number;

  /**
   * Total number of roadmap tasks
   */
  totalTasks: number;

  /**
   * Number of completed roadmap tasks
   */
  completedTasks: number;

  /**
   * Next task to work on (first PENDING or IN_PROGRESS item)
   * Null if no roadmap or all tasks completed
   */
  nextTask: RoadmapItemDTO | null;
}
