export interface RoadmapItemDTO {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
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
