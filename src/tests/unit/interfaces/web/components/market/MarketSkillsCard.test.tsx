import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketSkillsCard } from "@/interfaces/web/components/market/MarketSkillsCard";
import type { TopSkill } from "@/infrastructure/ai/schemas/marketSchema";

describe("MarketSkillsCard", () => {
  const mockSkills: TopSkill[] = [
    { name: "React", relevance: 95 },
    { name: "Rust", relevance: 80 },
    { name: "PostgreSQL", relevance: 75 },
    { name: "AWS", relevance: 85 },
  ];

  describe("skill count", () => {
    it("should render the exact number of skills provided", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      expect(screen.getByText("React")).toBeDefined();
      expect(screen.getByText("Rust")).toBeDefined();
      expect(screen.getByText("PostgreSQL")).toBeDefined();
      expect(screen.getByText("AWS")).toBeDefined();
    });

    it("should render correct number of badge elements", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      const skillNames = ["React", "Rust", "PostgreSQL", "AWS"];
      skillNames.forEach((name) => {
        expect(screen.getByText(name)).toBeDefined();
      });
    });
  });

  describe("skill names", () => {
    it("should display skill name 'React' correctly", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      expect(screen.getByText("React")).toBeDefined();
    });

    it("should display skill name 'Rust' correctly", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      expect(screen.getByText("Rust")).toBeDefined();
    });
  });

  describe("empty state", () => {
    it("should handle empty skills array gracefully", () => {
      render(<MarketSkillsCard skills={[]} />);

      expect(screen.getByText(/No skills data available/)).toBeDefined();
    });
  });

  describe("card structure", () => {
    it("should render the Top Skills title", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      expect(screen.getByText(/Top Skills/)).toBeDefined();
    });

    it("should render the description", () => {
      render(<MarketSkillsCard skills={mockSkills} />);

      expect(
        screen.getByText(/Most in-demand skills for this role/),
      ).toBeDefined();
    });
  });
});
