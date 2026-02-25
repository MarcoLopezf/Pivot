export class RoadmapLimitExceededError extends Error {
  constructor(maxRoadmaps: number) {
    super(
      `Roadmap limit reached. A free account can have a maximum of ${maxRoadmaps} roadmaps.`,
    );
    this.name = "RoadmapLimitExceededError";
  }
}
