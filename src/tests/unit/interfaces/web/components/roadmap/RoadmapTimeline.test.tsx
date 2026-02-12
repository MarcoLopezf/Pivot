import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("RoadmapTimeline Component", () => {
  const mockRoadmap: RoadmapDTO = {
    id: "roadmap-001",
    goalId: "goal-001",
    title: "Test Roadmap",
    progress: 33,
    items: [
      {
        id: "item-001",
        title: "Learn TypeScript",
        description: "Study TS fundamentals",
        order: 1,
        status: "completed",
        type: "theory" as const,
        topic: "typescript",
        difficulty: "beginner",
        submissionUrl: null,
      },
      {
        id: "item-002",
        title: "Learn React",
        description: "Study React hooks",
        order: 2,
        status: "in_progress",
        type: "theory" as const,
        topic: "react",
        difficulty: "intermediate",
        submissionUrl: null,
      },
      {
        id: "item-003",
        title: "Learn Node.js",
        description: "Study Node.js basics",
        order: 3,
        status: "pending",
        type: "theory" as const,
        topic: "nodejs",
        difficulty: "beginner",
        submissionUrl: null,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render all roadmap items", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    expect(screen.getByText("Learn TypeScript")).toBeDefined();
    expect(screen.getByText("Learn React")).toBeDefined();
    expect(screen.getByText("Learn Node.js")).toBeDefined();
  });

  it("should display correct status badges", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    expect(screen.getByText("Completed")).toBeDefined();
    expect(screen.getByText("In Progress")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
  });

  it("should render navigation links to item detail pages", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    const links = screen.getAllByRole("link");
    expect(links[0].getAttribute("href")).toBe(
      "/roadmap/roadmap-001/item/item-001",
    );
    expect(links[1].getAttribute("href")).toBe(
      "/roadmap/roadmap-001/item/item-002",
    );
    expect(links[2].getAttribute("href")).toBe(
      "/roadmap/roadmap-001/item/item-003",
    );
  });

  it("should render upcoming items with normal styling", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    const upcomingTitle = screen.getByText("Learn Node.js");
    const className = upcomingTitle.getAttribute("class") || "";
    expect(className).not.toContain("italic");
    expect(className).toContain("text-slate-700");
  });

  it("should render expanded section for in-progress item", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    expect(screen.getByText("Time Left")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
    expect(screen.getByText("Type")).toBeDefined();
    expect(screen.getByText("Pace")).toBeDefined();
  });

  it("should show topic in meta row", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    expect(screen.getByText("typescript")).toBeDefined();
    expect(screen.getByText("react")).toBeDefined();
    expect(screen.getByText("nodejs")).toBeDefined();
  });

  it("should show time estimate based on difficulty", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    // beginner items show "2h 15m", intermediate shows "3h 30m"
    const beginnerTimes = screen.getAllByText("2h 15m");
    expect(beginnerTimes.length).toBeGreaterThanOrEqual(1);
    const intermediateTimes = screen.getAllByText("3h 30m");
    expect(intermediateTimes.length).toBeGreaterThanOrEqual(1);
  });

  it("should handle empty roadmap items", () => {
    const emptyRoadmap: RoadmapDTO = {
      ...mockRoadmap,
      items: [],
      progress: 0,
    };

    const { container } = render(<RoadmapTimeline roadmap={emptyRoadmap} />);
    expect(container.querySelector("[data-testid]")).toBeNull();
  });

  it("should render item descriptions", () => {
    render(<RoadmapTimeline roadmap={mockRoadmap} />);

    expect(screen.getByText("Study TS fundamentals")).toBeDefined();
    expect(screen.getByText("Study React hooks")).toBeDefined();
    expect(screen.getByText("Study Node.js basics")).toBeDefined();
  });
});
