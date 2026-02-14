import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, Flame, Play, ArrowRight } from "lucide-react";

interface CurrentModuleInfo {
  id: string;
  title: string;
  tags: string[];
}

interface RoadmapHeaderProps {
  title: string;
  description: string;
  progress: number;
  totalItems: number;
  completedItems: number;
  totalHours: number;
  currentStreak: number;
  roadmapId: string;
  currentModule: CurrentModuleInfo | null;
}

export function RoadmapHeader({
  title,
  description,
  progress,
  totalItems,
  completedItems,
  totalHours,
  currentStreak,
  roadmapId,
  currentModule,
}: RoadmapHeaderProps): React.ReactElement {
  const remainingItems = totalItems - completedItems;
  const hoursPerModule =
    totalItems > 0 ? Math.round(totalHours / totalItems) : 0;
  const hoursLeft = remainingItems * hoursPerModule;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6">
      <div className="bg-[#1D2D50] text-white rounded-xl overflow-hidden">
        {/* Top section */}
        <div className="px-6 md:px-8 pt-8 pb-6">
          {/* Career Path label */}
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs uppercase tracking-widest text-slate-400">
              Career Path
            </span>
          </div>

          {/* Title + Active Learner row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            <Badge className="bg-[#133B5C] text-slate-300 border-0 px-3 py-1.5 text-xs font-medium hover:bg-[#133B5C] shrink-0 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-2 inline-block" />
              Active Learner
            </Badge>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-6 md:px-8">
          <div className="flex items-center gap-3">
            <Progress
              value={progress}
              className="h-2 flex-1 bg-[#133B5C] rounded-full [&>div]:bg-[#FCDAB7]"
            />
            <span className="text-sm font-medium text-slate-300">
              {progress}%
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-6 md:px-8 py-5">
          <div className="grid grid-cols-2 gap-4 md:flex md:items-center md:divide-x md:divide-slate-600 md:gap-0">
            {/* Progress */}
            <div className="flex items-center gap-3 md:pr-6">
              <Settings className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Progress
                </p>
                <p className="text-lg font-bold">
                  {completedItems}/{totalItems}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    modules
                  </span>
                </p>
              </div>
            </div>

            {/* Est. Time Left */}
            <div className="flex items-center gap-3 md:px-6">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Est. Time Left
                </p>
                <p className="text-lg font-bold">{hoursLeft}h</p>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3 md:pl-6">
              <Flame className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Current Streak
                </p>
                <p className="text-lg font-bold">
                  {currentStreak}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Days
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Card */}
        {currentModule && (
          <div className="px-6 md:px-8 pb-6">
            <Link
              href={`/roadmap/${roadmapId}/item/${currentModule.id}`}
              className="group block"
            >
              <div className="flex items-center gap-4 rounded-lg bg-[#133B5C] p-4 transition-colors hover:bg-[#1a4a6e]">
                <div className="h-10 w-10 rounded-full bg-[#1E5F74] flex items-center justify-center flex-shrink-0">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Continue Learning
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {currentModule.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentModule.tags.join(", ")}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
