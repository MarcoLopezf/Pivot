"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, MapPin, Plus, Check } from "lucide-react";
import type { RoadmapListItemDTO } from "@application/use-cases/learning/GetUserRoadmaps";

interface RoadmapSwitcherProps {
  currentRoadmapId?: string;
  roadmaps: RoadmapListItemDTO[];
}

export function RoadmapSwitcher({
  currentRoadmapId,
  roadmaps,
}: RoadmapSwitcherProps): React.ReactElement {
  const router = useRouter();

  const currentRoadmap = roadmaps.find((r) => r.id === currentRoadmapId);
  const otherRoadmaps = roadmaps.filter((r) => r.id !== currentRoadmapId);

  const displayTitle = currentRoadmap?.title ?? "Select a path";
  const displayRole = currentRoadmap?.role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 h-auto max-w-[280px] hover:bg-slate-100 transition-colors"
        >
          <MapPin className="h-4 w-4 shrink-0 text-[#1E5F74]" />
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-medium truncate w-full text-slate-900">
              {displayTitle}
            </span>
            {displayRole && (
              <span className="text-xs text-slate-500 truncate w-full">
                {displayRole}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[280px] bg-white border-slate-200 text-slate-900"
      >
        <DropdownMenuLabel className="text-xs text-slate-500">
          Learning Paths
        </DropdownMenuLabel>

        {roadmaps.length === 0 && (
          <DropdownMenuItem disabled className="text-slate-400 text-sm">
            No paths yet
          </DropdownMenuItem>
        )}

        {currentRoadmap && (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer focus:bg-slate-100 focus:text-slate-900"
            onSelect={() => router.push(`/roadmap/${currentRoadmap.id}`)}
          >
            <Check className="h-4 w-4 shrink-0 text-[#1E5F74]" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate text-slate-900">
                {currentRoadmap.title}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {currentRoadmap.role}
              </span>
            </div>
          </DropdownMenuItem>
        )}

        {otherRoadmaps.map((roadmap) => (
          <DropdownMenuItem
            key={roadmap.id}
            className="flex items-center gap-2 cursor-pointer focus:bg-slate-100 focus:text-slate-900"
            onSelect={() => router.push(`/roadmap/${roadmap.id}`)}
          >
            <div className="h-4 w-4 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm truncate text-slate-700">
                {roadmap.title}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {roadmap.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-slate-200" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-[#1E5F74] focus:bg-slate-100 focus:text-[#1E5F74]"
          onSelect={() => router.push("/onboarding")}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Create New Path</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
