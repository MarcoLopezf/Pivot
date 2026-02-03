import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketCareerLadderCard } from "@/interfaces/web/components/market/MarketCareerLadderCard";
import type { CareerLadder } from "@/infrastructure/ai/schemas/marketSchema";

describe("MarketCareerLadderCard", () => {
  const mockSalaryLadder: CareerLadder = {
    junior: { min: 25, max: 40, median: 32, currency: "USD" },
    mid: { min: 45, max: 70, median: 55, currency: "USD" },
    senior: { min: 75, max: 120, median: 95, currency: "USD" },
  };

  describe("level display", () => {
    it("should render Junior level with correct label", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("Junior")).toBeDefined();
    });

    it("should render Mid-Level with correct label", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("Mid-Level")).toBeDefined();
    });

    it("should render Senior level with correct label", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("Senior")).toBeDefined();
    });
  });

  describe("salary display", () => {
    it("should display junior median salary", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("$32/hr")).toBeDefined();
    });

    it("should display mid median salary", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("$55/hr")).toBeDefined();
    });

    it("should display senior median salary", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("$95/hr")).toBeDefined();
    });
  });

  describe("growth indicator", () => {
    it("should display Jr to Sr growth percentage", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      // Growth: (95-32)/32 * 100 = 197%
      expect(screen.getByText("+197%")).toBeDefined();
    });
  });

  describe("card structure", () => {
    it("should render Career Ladder title", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("Career Ladder")).toBeDefined();
    });

    it("should render experience years for each level", () => {
      render(<MarketCareerLadderCard salaryLadder={mockSalaryLadder} />);

      expect(screen.getByText("0-2 yrs")).toBeDefined();
      expect(screen.getByText("2-5 yrs")).toBeDefined();
      expect(screen.getByText("5+ yrs")).toBeDefined();
    });
  });
});
