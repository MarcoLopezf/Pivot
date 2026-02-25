import { DomainError } from "@domain/shared/errors/DomainError";

export class RoadmapLimitExceededError extends DomainError {
  constructor(maxRoadmaps: number) {
    super(
      `Roadmap limit reached. A free account can have a maximum of ${maxRoadmaps} roadmaps.`,
    );
    this.name = "RoadmapLimitExceededError";
  }
}
