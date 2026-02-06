import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoadmapTimeline } from "@interfaces/web/components/roadmap/RoadmapTimeline";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";

// Mock next/link to render as a simple anchor tag in tests
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

  it("should call onItemStatusChange when status button is clicked", async () => {
    const onItemStatusChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Find and click the "Start" button (for pending item - "Learn Node.js")
    const startButton = screen.getByText("Start");
    await user.click(startButton);

    // Status change SHOULD be called when clicking the status button
    expect(onItemStatusChange).toHaveBeenCalledTimes(1);
    expect(onItemStatusChange).toHaveBeenCalledWith("item-003", "in_progress");
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

    // Find the completed item title (rendered as a Link/anchor)
    const completedTitle = screen.getByText("Learn TypeScript");

    // Check for line-through or opacity classes on the link element
    const className = completedTitle.getAttribute("class") || "";
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

  it("should NOT trigger status change when clicking 'Resources' tab button", async () => {
    const onItemStatusChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
      />,
    );

    // Find and click "Resources" tab button
    const resourcesTab = screen.getAllByText(/^Resources$/i)[0];
    await user.click(resourcesTab);

    // Status change should NOT be called (event should be stopped by tab click)
    expect(onItemStatusChange).not.toHaveBeenCalled();
  });

  it("should NOT trigger status change when clicking action buttons inside item card", async () => {
    const onItemStatusChange = vi.fn();
    const onTakeQuiz = vi.fn();
    const user = userEvent.setup();

    // First render: test the "Start" button
    const { unmount } = render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
        onTakeQuiz={onTakeQuiz}
      />,
    );

    // Find and click the "Start" button (for pending item)
    const startButton = screen.getByText("Start");
    await user.click(startButton);

    // Status change SHOULD be called once (this button explicitly changes status)
    expect(onItemStatusChange).toHaveBeenCalledTimes(1);

    // Clean up first render
    unmount();

    // Reset mocks for second test
    onItemStatusChange.mockClear();
    onTakeQuiz.mockClear();

    // Second render: test the "Take Quiz" button
    render(
      <RoadmapTimeline
        roadmap={mockRoadmap}
        onItemStatusChange={onItemStatusChange}
        onTakeQuiz={onTakeQuiz}
      />,
    );

    // Find the "Take Quiz" button from the IN_PROGRESS item (not disabled)
    // The completed item has a disabled Take Quiz button
    const takeQuizButtons = screen.getAllByText(/take quiz/i);
    const activeQuizButton = takeQuizButtons.find(
      (btn) => !btn.closest("button")?.hasAttribute("disabled"),
    );

    if (activeQuizButton) {
      await user.click(activeQuizButton);
    }

    // Status change should NOT be called (only quiz handler should be called)
    expect(onItemStatusChange).not.toHaveBeenCalled();
    expect(onTakeQuiz).toHaveBeenCalledTimes(1);
  });
});
