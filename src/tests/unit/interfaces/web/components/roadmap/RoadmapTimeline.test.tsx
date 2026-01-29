import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

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
      },
      {
        id: "item-002",
        title: "Learn React",
        description: "Study React hooks",
        order: 2,
        status: "in_progress",
      },
      {
        id: "item-003",
        title: "Learn Node.js",
        description: "Study Node.js basics",
        order: 3,
        status: "pending",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render progress bar", () => {
    const onItemStatusChange = vi.fn();
    const { container } = render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Find progress element
    const progressSection = container.querySelector("div");
    expect(progressSection).toBeDefined();

    // Check for progress text
    const progressText = screen.getByText("33%");
    expect(progressText).toBeDefined();
  });

  it("should render all roadmap items", () => {
    const onItemStatusChange = vi.fn();
    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    expect(screen.getByText("Learn TypeScript")).toBeDefined();
    expect(screen.getByText("Learn React")).toBeDefined();
    expect(screen.getByText("Learn Node.js")).toBeDefined();
  });

  it("should display correct status badges", () => {
    const onItemStatusChange = vi.fn();
    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Should render at least one badge of each type
    const badges = screen.getAllByText(/completed|in progress|pending/i);
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it("should call onItemStatusChange when item card is clicked", async () => {
    const onItemStatusChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Find and click a card - any click handler should work
    const itemElement = screen.getByText("Learn Node.js");
    const itemCard = itemElement.closest("div[class*='ml-16']");
    if (itemCard) {
      await user.click(itemCard);
      expect(onItemStatusChange).toHaveBeenCalled();
    } else {
      // Fallback: just click the element directly
      await user.click(itemElement);
      expect(onItemStatusChange).toHaveBeenCalled();
    }
  });

  it("should display step counter for each item", () => {
    const onItemStatusChange = vi.fn();
    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    expect(screen.getByText(/step 1 of 3/i)).toBeDefined();
    expect(screen.getByText(/step 2 of 3/i)).toBeDefined();
    expect(screen.getByText(/step 3 of 3/i)).toBeDefined();
  });

  it("should apply strikethrough styling to completed items", () => {
    const onItemStatusChange = vi.fn();
    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Find the completed item title
    const completedTitle = screen.getByText("Learn TypeScript");
    const titleParent = completedTitle.closest("h3");

    // Check for line-through or opacity classes
    const className = titleParent?.getAttribute("class") || "";
    const hasStrikethrough =
      className.includes("line-through") || className.includes("opacity");
    expect(hasStrikethrough).toBe(true);
  });

  it("should handle empty roadmap items", () => {
    const emptyRoadmap: RoadmapDTO = {
      ...mockRoadmap,
      items: [],
      progress: 0,
    };

    const onItemStatusChange = vi.fn();
    render(
      <RoadmapTimeline
        roadmap={emptyRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Should render progress bar even with no items
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeDefined();
  });
});
