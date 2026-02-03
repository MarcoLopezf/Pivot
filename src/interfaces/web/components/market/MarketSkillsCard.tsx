import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopSkill } from "@/infrastructure/ai/schemas/marketSchema";

interface MarketSkillsCardProps {
  skills: TopSkill[];
}

/**
 * MarketSkillsCard
 *
 * Displays top skills for a role with relevance-based opacity.
 */
export function MarketSkillsCard({ skills }: MarketSkillsCardProps) {
  if (skills.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">🎯</span>
            Top Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No skills data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-2xl">🎯</span>
          Top Skills
        </CardTitle>
        <CardDescription>Most in-demand skills for this role</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill.name}
              variant="secondary"
              className="text-sm"
              style={{ opacity: 0.5 + (skill.relevance / 100) * 0.5 }}
            >
              {skill.name}
              <span className="ml-1 opacity-60">{skill.relevance}%</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
