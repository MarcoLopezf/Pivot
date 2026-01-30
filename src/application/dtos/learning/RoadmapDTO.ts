/**
 * Strict literal union type for roadmap item status
 */
export type RoadmapItemStatus = "pending" | "in_progress" | "completed";
export type RoadmapItemType = "theory" | "project";

export interface RoadmapItemDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: RoadmapItemStatus;
  type: RoadmapItemType;
  topic: string;
  difficulty: string;
  submissionUrl: string | null;
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
