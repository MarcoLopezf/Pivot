/**
 * Strict literal union type for roadmap item status
 */
export type RoadmapItemStatus = "pending" | "in_progress" | "completed";

export interface RoadmapItemDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: RoadmapItemStatus;
}

export interface RoadmapDTO {
  id: string;
  goalId: string;
  title: string;
  progress: number;
  items: RoadmapItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}
