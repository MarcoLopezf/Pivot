import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Clock, Flame } from "lucide-react";

interface RoadmapStatsProps {
  totalItems: number;
  completedItems: number;
  totalHours: number;
  currentStreak: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

function StatCard({
  icon,
  label,
  value,
  description,
}: StatCardProps): React.ReactElement {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * RoadmapStats Component
 *
 * Displays a grid of 4 stat cards: Total Modules, Completed,
 * Estimated Time, and Current Streak.
 */
export function RoadmapStats({
  totalItems,
  completedItems,
  totalHours,
  currentStreak,
}: RoadmapStatsProps): React.ReactElement {
  const progressPercent =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
      <StatCard
        icon={<BookOpen className="h-5 w-5 text-blue-600" />}
        label="Total Modules"
        value={String(totalItems)}
        description={`${progressPercent}% complete`}
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        label="Completed"
        value={String(completedItems)}
        description={`of ${totalItems} modules`}
      />
      <StatCard
        icon={<Clock className="h-5 w-5 text-amber-600" />}
        label="Estimated Time"
        value={`${totalHours}h`}
        description="Total learning time"
      />
      <StatCard
        icon={<Flame className="h-5 w-5 text-orange-600" />}
        label="Current Streak"
        value={String(currentStreak)}
        description="Modules in a row"
      />
    </div>
  );
}
