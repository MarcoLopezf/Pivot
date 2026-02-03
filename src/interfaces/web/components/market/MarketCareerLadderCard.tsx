import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CareerLadder } from "@/infrastructure/ai/schemas/marketSchema";

interface MarketCareerLadderCardProps {
  salaryLadder: CareerLadder;
}

const levelConfig = {
  junior: { label: "Junior", years: "0-2 yrs", icon: "🌱" },
  mid: { label: "Mid-Level", years: "2-5 yrs", icon: "🌿" },
  senior: { label: "Senior", years: "5+ yrs", icon: "🌳" },
} as const;

type LevelKey = keyof typeof levelConfig;

/**
 * MarketCareerLadderCard
 *
 * Displays salary ranges across career levels (Junior, Mid, Senior).
 * Enables users to see progression opportunities.
 */
export function MarketCareerLadderCard({
  salaryLadder,
}: MarketCareerLadderCardProps) {
  const levels: LevelKey[] = ["junior", "mid", "senior"];

  const formatCurrency = (value: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">📊</span>
          Career Ladder
        </CardTitle>
        <CardDescription>
          Salary progression by experience level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {levels.map((level) => {
          const data = salaryLadder[level];
          const config = levelConfig[level];

          return (
            <div
              key={level}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{config.icon}</span>
                <div>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.years}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {formatCurrency(data.median, data.currency)}/hr
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(data.min, data.currency)} -{" "}
                  {formatCurrency(data.max, data.currency)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Growth indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Jr → Sr Growth</span>
            <Badge variant="secondary">
              +
              {Math.round(
                ((salaryLadder.senior.median - salaryLadder.junior.median) /
                  salaryLadder.junior.median) *
                  100,
              )}
              %
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
