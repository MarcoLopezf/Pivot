import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressOverviewProps {
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

/**
 * ProgressOverview Component
 *
 * Displays the user's overall progress in their learning roadmap
 * with a visual progress bar and task completion statistics.
 */
export function ProgressOverview({
  progress,
  totalTasks,
  completedTasks,
}: ProgressOverviewProps): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
        <CardDescription>
          Your journey to achieving your career goal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tasks Completed</span>
          <span className="font-semibold">
            {completedTasks} / {totalTasks}
          </span>
        </div>
        {progress === 100 && totalTasks > 0 && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Congratulations! You have completed all tasks in your roadmap.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
