import Link from "next/link";
import { RoadmapDTO } from "@application/dtos/learning/RoadmapDTO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Check,
  Play,
  Circle,
  Clock,
  BookOpen,
  FlaskConical,
} from "lucide-react";

export interface RoadmapTimelineProps {
  roadmap: RoadmapDTO;
}

function getEstimatedTime(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "2h 15m";
    case "intermediate":
      return "3h 30m";
    case "advanced":
      return "5h 00m";
    default:
      return "2h 00m";
  }
}

interface RoadmapTimelineItemProps {
  item: RoadmapDTO["items"][0];
  roadmapId: string;
  isLastItem: boolean;
}

function RoadmapTimelineItem({
  item,
  roadmapId,
  isLastItem,
}: RoadmapTimelineItemProps): React.ReactElement {
  const isCompleted = item.status === "completed";
  const isInProgress = item.status === "in_progress";
  const isUpcoming = item.status === "pending";

  return (
    <div
      className="relative flex gap-6 pb-10"
      data-testid={`roadmap-item-${item.id}`}
    >
      {/* Vertical connecting line */}
      {!isLastItem && (
        <div
          className={cn(
            "absolute left-5 top-12 bottom-0 w-0.5",
            isCompleted ? "bg-green-300" : "bg-slate-200",
          )}
        />
      )}

      {/* Status Icon */}
      <div className="relative z-10 flex-shrink-0">
        {isCompleted && (
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
            <Check className="h-5 w-5 text-white" />
          </div>
        )}
        {isInProgress && (
          <div className="h-10 w-10 rounded-full bg-[#1E5F74] flex items-center justify-center shadow-sm">
            <Play className="h-5 w-5 text-white fill-white" />
          </div>
        )}
        {isUpcoming && (
          <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
            <Circle className="h-4 w-4 text-slate-400" />
          </div>
        )}
      </div>

      {/* Card */}
      <Link
        href={`/roadmap/${roadmapId}/item/${item.id}`}
        className="flex-1 group"
      >
        <Card
          className={cn(
            "p-5 transition-all hover:shadow-md border",
            isInProgress && "border-[#1E5F74]/30 bg-white shadow-sm",
            isCompleted && "border-slate-200 bg-white",
            isUpcoming && "border-slate-200 bg-white",
          )}
        >
          {/* Title row + status badge */}
          <div className="flex items-start justify-between mb-2">
            <h3
              className={cn(
                "text-lg font-semibold group-hover:text-[#1E5F74] transition-colors",
                isCompleted && "text-slate-700",
                isInProgress && "text-slate-900",
                isUpcoming && "text-slate-700",
              )}
            >
              {item.title}
            </h3>
            {isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-0 text-xs hover:bg-green-100">
                Completed
              </Badge>
            )}
            {isInProgress && (
              <Badge className="bg-orange-100 text-orange-700 border-0 text-xs uppercase tracking-wide font-semibold hover:bg-orange-100">
                In Progress
              </Badge>
            )}
            {isUpcoming && (
              <Badge
                variant="outline"
                className="text-slate-500 border-slate-300 text-xs"
              >
                Upcoming
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm mb-3 leading-relaxed text-slate-600">
            {item.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getEstimatedTime(item.difficulty)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {item.tags.join(", ")}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                item.type === "theory"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600",
              )}
            >
              <FlaskConical className="h-3 w-3" />
              {item.type === "theory" ? "Theory" : "Project"}
            </span>
          </div>

          {/* IN PROGRESS expanded section */}
          {isInProgress && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Progress
                value={30}
                className="h-1.5 bg-slate-100 mb-3 [&>div]:bg-[#1E5F74]"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500">
                <div>
                  <p className="text-[10px] uppercase text-slate-400">
                    Time Left
                  </p>
                  <p className="font-semibold text-slate-700">
                    {getEstimatedTime(item.difficulty)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">
                    Content
                  </p>
                  <p className="font-semibold text-slate-700">
                    {item.type === "theory" ? "Videos" : "Labs"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Type</p>
                  <p className="font-semibold text-slate-700 capitalize">
                    {item.type}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400">Pace</p>
                  <p className="font-semibold text-slate-700">Active</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
}

export function RoadmapTimeline({
  roadmap,
}: RoadmapTimelineProps): React.ReactElement {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="relative">
        {roadmap.items.map((item, index) => (
          <RoadmapTimelineItem
            key={item.id}
            item={item}
            roadmapId={roadmap.id}
            isLastItem={index === roadmap.items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
