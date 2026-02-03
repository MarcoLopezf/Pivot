import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Demand } from "@/infrastructure/ai/schemas/marketSchema";

interface MarketDemandCardProps {
  demand: Demand;
}

const getTrendIcon = (trend: string): string => {
  const t = trend.toLowerCase();
  if (t.includes("grow") || t.includes("rising")) return "📈";
  if (t.includes("declin") || t.includes("fall")) return "📉";
  return "➡️";
};

const getVerdictColor = (verdict: string): string => {
  const v = verdict.toLowerCase();
  if (v.includes("high") || v.includes("strong")) return "bg-green-500";
  if (v.includes("medium") || v.includes("moderate")) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * MarketDemandCard
 *
 * Displays market demand information including score, verdict, and trend.
 */
export function MarketDemandCard({ demand }: MarketDemandCardProps) {
  const { score, verdict, trend } = demand;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">📊</span>
          Market Demand
        </CardTitle>
        <CardDescription>Current job market conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="text-center">
          <span className="text-4xl font-bold text-primary">{score}</span>
          <span className="text-muted-foreground">/100</span>
          <p className="text-sm text-muted-foreground mt-1">Demand Score</p>
        </div>

        {/* Progress Bar */}
        <Progress value={score} className="h-3" />

        {/* Verdict and Trend */}
        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Verdict</p>
            <Badge className={getVerdictColor(verdict)}>{verdict}</Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Trend</p>
            <span className="text-lg">
              {getTrendIcon(trend)} {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
