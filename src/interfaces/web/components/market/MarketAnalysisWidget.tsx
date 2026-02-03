"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketCareerLadderCard } from "./MarketCareerLadderCard";
import { MarketDemandCard } from "./MarketDemandCard";
import { MarketSkillsCard } from "./MarketSkillsCard";
import { MarketAnalysisSkeleton } from "./MarketAnalysisSkeleton";
import type { MarketResearch } from "@/infrastructure/ai/schemas/marketSchema";

/**
 * MarketAnalysisWidget
 *
 * Organism component that handles user input, calls the API,
 * and orchestrates the display of Market Intelligence results.
 */
export function MarketAnalysisWidget() {
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("Argentina");
  const [data, setData] = useState<MarketResearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!role) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/market/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: role, region }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const result: MarketResearch = await res.json();
      setData(result);
    } catch {
      setError("Failed to analyze market. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleAnalyze}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            {/* Role Input */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="role">Job Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role (e.g., Rust Developer)"
              />
            </div>

            {/* Region Input */}
            <div className="w-full md:w-48 space-y-2">
              <Label htmlFor="region">Target Region</Label>
              <Input
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Enter region (e.g., LATAM)"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading || !role.trim()}>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Market
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isLoading && <MarketAnalysisSkeleton />}

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
      )}

      {data && !isLoading && (
        <>
          {/* Cards Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <MarketCareerLadderCard salaryLadder={data.salary_ladder} />
            <MarketDemandCard demand={data.demand} />
            <MarketSkillsCard skills={data.top_skills} />

            {/* Summary Card (Full Width) */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Market Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.analysis.summary}</p>
                <div className="mt-4">
                  <h4 className="font-medium">Key Growth Factor</h4>
                  <p className="text-muted-foreground">
                    {data.analysis.key_growth_factor}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
