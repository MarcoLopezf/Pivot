import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoadmapHeaderProps {
  title: string;
  role: string;
  progress: number;
  totalItems: number;
  completedItems: number;
}

/**
 * RoadmapHeader Component
 *
 * Hero section displaying the roadmap goal, target role badge,
 * and a large progress bar for the roadmap overview page.
 */
export function RoadmapHeader({
  title,
  role,
  progress,
  totalItems,
  completedItems,
}: RoadmapHeaderProps): React.ReactElement {
  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
      {/* Back Navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Title Section */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
          <Target className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {role && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0 hover:bg-white/30"
              >
                {role}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 hover:bg-white/30"
            >
              {totalItems} Modules
            </Badge>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-blue-100">Overall Progress</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className="h-3 bg-white/20 [&>div]:bg-white"
        />
        <p className="text-xs text-blue-200">
          {completedItems} of {totalItems} modules completed
        </p>
      </div>
    </div>
  );
}
