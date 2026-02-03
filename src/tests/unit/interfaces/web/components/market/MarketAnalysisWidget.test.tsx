import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock the child components to avoid testing their internal UI
vi.mock("@/interfaces/web/components/market/MarketCareerLadderCard", () => ({
  MarketCareerLadderCard: () => (
    <div data-testid="career-ladder-card">CareerLadderCard</div>
  ),
}));

vi.mock("@/interfaces/web/components/market/MarketDemandCard", () => ({
  MarketDemandCard: () => <div data-testid="demand-card">DemandCard</div>,
}));

vi.mock("@/interfaces/web/components/market/MarketSkillsCard", () => ({
  MarketSkillsCard: () => <div data-testid="skills-card">SkillsCard</div>,
}));

vi.mock("@/interfaces/web/components/market/MarketAnalysisSkeleton", () => ({
  MarketAnalysisSkeleton: () => (
    <div data-testid="analysis-skeleton">Loading...</div>
  ),
}));

// Import after mocks
import { MarketAnalysisWidget } from "@/interfaces/web/components/market/MarketAnalysisWidget";

describe("MarketAnalysisWidget", () => {
  const mockMarketResearch = {
    role: "Rust Developer",
    region: "Argentina",
    salary_ladder: {
      junior: { min: 25, max: 40, median: 32, currency: "USD" },
      mid: { min: 45, max: 70, median: 55, currency: "USD" },
      senior: { min: 75, max: 120, median: 95, currency: "USD" },
    },
    demand: {
      score: 85,
      verdict: "High",
      trend: "Growing",
    },
    top_skills: [
      { name: "Rust", relevance: 95 },
      { name: "WebAssembly", relevance: 80 },
    ],
    analysis: {
      summary: "Rust developers are in high demand due to memory safety focus.",
      key_growth_factor: "Cloud native and systems programming",
    },
  };

  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Scenario 1: Initial Render", () => {
    it("should render the Role input field", () => {
      render(<MarketAnalysisWidget />);

      expect(screen.getByPlaceholderText(/role/i)).toBeDefined();
    });

    it("should render the Region input field", () => {
      render(<MarketAnalysisWidget />);

      expect(screen.getByPlaceholderText(/region/i)).toBeDefined();
    });

    it("should render the Analyze Market button", () => {
      render(<MarketAnalysisWidget />);

      expect(screen.getByRole("button", { name: /analyze/i })).toBeDefined();
    });

    it("should NOT show result cards initially", () => {
      render(<MarketAnalysisWidget />);

      expect(screen.queryByTestId("career-ladder-card")).toBeNull();
      expect(screen.queryByTestId("demand-card")).toBeNull();
      expect(screen.queryByTestId("skills-card")).toBeNull();
    });

    it("should NOT show loading skeleton initially", () => {
      render(<MarketAnalysisWidget />);

      expect(screen.queryByTestId("analysis-skeleton")).toBeNull();
    });
  });

  describe("Scenario 2: User Input & API Call", () => {
    it("should call fetch with correct parameters when form is submitted", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const regionInput = screen.getByPlaceholderText(/region/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.change(regionInput, { target: { value: "Global" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/market/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "Rust Developer", region: "Global" }),
        });
      });
    });

    it("should show loading skeleton immediately after submitting", async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      expect(screen.getByTestId("analysis-skeleton")).toBeDefined();
    });
  });

  describe("Scenario 3: Successful Data Display", () => {
    it("should hide loading skeleton after successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId("analysis-skeleton")).toBeNull();
      });
    });

    it("should render MarketCareerLadderCard after successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("career-ladder-card")).toBeDefined();
      });
    });

    it("should render MarketDemandCard after successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("demand-card")).toBeDefined();
      });
    });

    it("should render MarketSkillsCard after successful response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("skills-card")).toBeDefined();
      });
    });

    it("should display the analysis summary text", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMarketResearch,
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Rust developers are in high demand/),
        ).toBeDefined();
      });
    });
  });

  describe("Scenario 4: Error Handling", () => {
    it("should display error message when API returns 500", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to analyze market/)).toBeDefined();
      });
    });

    it("should display error message when network fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to analyze market/)).toBeDefined();
      });
    });

    it("should NOT render result cards when API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to analyze market/)).toBeDefined();
      });

      expect(screen.queryByTestId("career-ladder-card")).toBeNull();
      expect(screen.queryByTestId("demand-card")).toBeNull();
      expect(screen.queryByTestId("skills-card")).toBeNull();
    });

    it("should hide loading skeleton after error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<MarketAnalysisWidget />);

      const roleInput = screen.getByPlaceholderText(/role/i);
      const submitButton = screen.getByRole("button", { name: /analyze/i });

      fireEvent.change(roleInput, { target: { value: "Rust Developer" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId("analysis-skeleton")).toBeNull();
      });
    });
  });
});
