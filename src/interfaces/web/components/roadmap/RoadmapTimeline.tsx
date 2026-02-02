"use client";

import React, { useState } from "react";
import {
  RoadmapDTO,
  RoadmapItemStatus,
} from "@application/dtos/learning/RoadmapDTO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { VideoCard } from "@/interfaces/web/components/learning/VideoCard";
import { useItemResources } from "@/interfaces/web/hooks/useItemResources";

export interface RoadmapTimelineProps {
  roadmap: RoadmapDTO;
  onItemStatusChange: (itemId: string, newStatus: RoadmapItemStatus) => void;
  onTakeQuiz?: (itemId: string) => void;
}

/**
 * RoadmapItem Sub-Component
 *
 * Individual roadmap item with expandable resources section
 */
interface RoadmapItemProps {
  item: RoadmapDTO["items"][0];
  index: number;
  totalItems: number;
  isLastItem: boolean;
  onStatusChange: (itemId: string, newStatus: RoadmapItemStatus) => void;
  onTakeQuiz?: (itemId: string) => void;
}

function RoadmapItem({
  item,
  index,
  totalItems,
  isLastItem,
  onStatusChange,
  onTakeQuiz,
}: RoadmapItemProps): React.ReactElement {
  const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);
  const { resources, isLoading, error, hasFetched, fetchResources } =
    useItemResources(item.id, item.topic);

  const getStatusIcon = (status: RoadmapItemStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "in_progress":
        return <Clock className="h-3 w-3 text-blue-600 animate-spin" />;
      case "pending":
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: RoadmapItemStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-600">
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Pending
          </Badge>
        );
    }
  };

  const getNextStatus = (
    currentStatus: RoadmapItemStatus,
  ): RoadmapItemStatus => {
    switch (currentStatus) {
      case "pending":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "completed":
        return "in_progress";
    }
  };

  const handleItemClick = () => {
    const nextStatus = getNextStatus(item.status);
    onStatusChange(item.id, nextStatus);
  };

  const handleToggleResources = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isResourcesExpanded && !hasFetched) {
      // Fetch resources when expanding for the first time
      fetchResources();
    }
    setIsResourcesExpanded(!isResourcesExpanded);
  };

  return (
    <div className="relative" data-testid={`roadmap-item-${item.id}`}>
      {/* Connector Line (not on last item) */}
      {!isLastItem && (
        <div className="absolute left-6 top-12 w-0.5 h-8 border-l-2 border-dashed border-gray-300" />
      )}

      {/* Status Icon */}
      <div className="absolute left-2 top-4 z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
        {getStatusIcon(item.status)}
      </div>

      {/* Card */}
      <Card
        className="ml-16 p-4 border-l-4 cursor-pointer"
        onClick={handleItemClick}
        style={{
          borderLeftColor:
            item.status === "completed"
              ? "#22c55e"
              : item.status === "in_progress"
                ? "#3b82f6"
                : "#d1d5db",
        }}
      >
        {/* Header with Step Counter */}
        <div className="hover:bg-gray-50 rounded p-2 -m-2 mb-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3
                className={`text-sm font-semibold ${
                  item.status === "completed" ? "line-through opacity-60" : ""
                }`}
              >
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Step {index + 1} of {totalItems}
              </p>
            </div>
            <div className="flex gap-2">
              {/* Take Quiz Button - Only for THEORY items not completed */}
              {item.type === "theory" &&
                item.status !== "completed" &&
                onTakeQuiz && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTakeQuiz(item.id);
                    }}
                    className="ml-2"
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Take Quiz
                  </Button>
                )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemClick();
                }}
                className="ml-2"
              >
                {item.status === "pending" && "Start"}
                {item.status === "in_progress" && "Mark Complete"}
                {item.status === "completed" && "Undo"}
              </Button>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3">{item.description}</p>
        </div>

        {/* Resources Section */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleResources}
            className="w-full justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Learning Resources</span>
              {hasFetched && (
                <Badge variant="secondary" className="ml-2">
                  {resources.length}
                </Badge>
              )}
            </div>
            {isResourcesExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Expandable Resources Content */}
          {isResourcesExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* Loading State */}
              {isLoading && (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="text-center py-6">
                  <p className="text-sm text-red-600">
                    Failed to load resources: {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchResources}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Resources Grid */}
              {!isLoading && !error && resources.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {resources.map((resource) => (
                    <VideoCard
                      key={resource.id || resource.url}
                      title={resource.title}
                      thumbnailUrl={resource.thumbnailUrl}
                      channelName={resource.channelName}
                      videoUrl={resource.url}
                      duration={resource.duration}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && resources.length === 0 && hasFetched && (
                <div className="text-center py-6">
                  <PlayCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    No resources found for this topic.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Try checking back later or explore other items!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex justify-end mt-3">
          {getStatusBadge(item.status)}
        </div>
      </Card>
    </div>
  );
}

/**
 * RoadmapTimeline Component
 *
 * Displays a vertical timeline of roadmap items with:
 * - Progress bar at the top
 * - Status indicators (completed/in_progress/pending)
 * - Interactive cards to toggle status
 * - Step counter (e.g., "Step 1 of 3")
 * - Progress calculation
 * - Expandable resources section per item
 */
export function RoadmapTimeline({
  roadmap,
  onItemStatusChange,
  onTakeQuiz,
}: RoadmapTimelineProps): React.ReactNode {
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Progress</h3>
          <span className="text-sm text-gray-600">{roadmap.progress}%</span>
        </div>
        <Progress value={roadmap.progress} className="h-2" />
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {roadmap.items.map((item, index) => (
          <RoadmapItem
            key={item.id}
            item={item}
            index={index}
            totalItems={roadmap.items.length}
            isLastItem={index === roadmap.items.length - 1}
            onStatusChange={onItemStatusChange}
            onTakeQuiz={onTakeQuiz}
          />
        ))}
      </div>
    </div>
  );
}
