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
          className="flex items-center gap-2 px-3 py-2 h-auto max-w-[280px] hover:bg-[#133B5C] transition-colors"
        >
          <MapPin className="h-4 w-4 shrink-0 text-[#FCDAB7]" />
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-medium truncate w-full text-white">
              {displayTitle}
            </span>
            {displayRole && (
              <span className="text-xs text-slate-300 truncate w-full">
                {displayRole}
              </span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Learning Paths
        </DropdownMenuLabel>

        {roadmaps.length === 0 && (
          <DropdownMenuItem disabled className="text-muted-foreground text-sm">
            No paths yet
          </DropdownMenuItem>
        )}

        {currentRoadmap && (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => router.push(`/roadmap/${currentRoadmap.id}`)}
          >
            <Check className="h-4 w-4 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {currentRoadmap.title}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentRoadmap.role}
              </span>
            </div>
          </DropdownMenuItem>
        )}

        {otherRoadmaps.map((roadmap) => (
          <DropdownMenuItem
            key={roadmap.id}
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => router.push(`/roadmap/${roadmap.id}`)}
          >
            <div className="h-4 w-4 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm truncate">{roadmap.title}</span>
              <span className="text-xs text-muted-foreground truncate">
                {roadmap.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary"
          onSelect={() => router.push("/onboarding")}
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Create New Path</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
