import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userName: string;
  careerGoal: string | null;
}

/**
 * DashboardHeader Component
 *
 * Displays a personalized greeting and the user's career goal
 * as a badge at the top of the dashboard.
 */
export function DashboardHeader({
  userName,
  careerGoal,
}: DashboardHeaderProps): React.ReactElement {
  const greeting = getGreeting();

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, {userName}
      </h1>
      {careerGoal && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Career Goal:</span>
          <Badge variant="default" className="text-sm">
            {careerGoal}
          </Badge>
        </div>
      )}
    </div>
  );
}

/**
 * Get time-appropriate greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}
