import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketDemandCard } from "@/interfaces/web/components/market/MarketDemandCard";
import type { Demand } from "@/infrastructure/ai/schemas/marketSchema";

describe("MarketDemandCard", () => {
  const mockDemandHigh: Demand = {
    score: 85,
    verdict: "High",
    trend: "Growing",
  };

  const mockDemandLow: Demand = {
    score: 25,
    verdict: "Low",
    trend: "Declining",
  };

  describe("score display", () => {
    it("should display the demand score", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText("85")).toBeDefined();
    });

    it("should display the /100 suffix", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText("/100")).toBeDefined();
    });
  });

  describe("verdict display", () => {
    it("should render the verdict text 'High'", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText("High")).toBeDefined();
    });

    it("should render the verdict text 'Low'", () => {
      render(<MarketDemandCard demand={mockDemandLow} />);

      expect(screen.getByText("Low")).toBeDefined();
    });
  });

  describe("trend display", () => {
    it("should render the trend text 'Growing'", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText(/Growing/)).toBeDefined();
    });

    it("should render the trend text 'Declining'", () => {
      render(<MarketDemandCard demand={mockDemandLow} />);

      expect(screen.getByText(/Declining/)).toBeDefined();
    });
  });

  describe("visual indicators", () => {
    it("should render 'High' verdict as a badge element", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      const highBadge = screen.getByText("High");
      expect(highBadge).toBeDefined();
      expect(highBadge.tagName.toLowerCase()).not.toBe("p");
    });

    it("should render trend icon for Growing", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText(/📈/)).toBeDefined();
    });

    it("should render trend icon for Declining", () => {
      render(<MarketDemandCard demand={mockDemandLow} />);

      expect(screen.getByText(/📉/)).toBeDefined();
    });
  });

  describe("card structure", () => {
    it("should render the Market Demand title", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText(/Market Demand/)).toBeDefined();
    });

    it("should render the Demand Score label", () => {
      render(<MarketDemandCard demand={mockDemandHigh} />);

      expect(screen.getByText(/Demand Score/)).toBeDefined();
    });
  });
});
