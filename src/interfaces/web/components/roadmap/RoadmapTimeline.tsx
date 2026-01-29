"use client";

import React from "react";
import {
  RoadmapDTO,
  RoadmapItemStatus,
} from "@application/dtos/learning/RoadmapDTO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Circle } from "lucide-react";

export interface RoadmapTimelineProps {
  roadmap: RoadmapDTO;
  onItemStatusChange: (itemId: string, newStatus: RoadmapItemStatus) => void;
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
 */
export function RoadmapTimeline({
  roadmap,
  onItemStatusChange,
}: RoadmapTimelineProps): React.ReactNode {
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

  const handleItemClick = (
    itemId: string,
    currentStatus: RoadmapItemStatus,
  ) => {
    const nextStatus = getNextStatus(currentStatus);
    onItemStatusChange(itemId, nextStatus);
  };

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
          <div
            key={item.id}
            className="relative"
            data-testid={`roadmap-item-${item.id}`}
          >
            {/* Connector Line (not on last item) */}
            {index < roadmap.items.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 border-l-2 border-dashed border-gray-300" />
            )}

            {/* Status Icon */}
            <div className="absolute left-2 top-4 z-10 flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
              {getStatusIcon(item.status)}
            </div>

            {/* Card */}
            <Card
              className="ml-16 p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4"
              onClick={() => handleItemClick(item.id, item.status)}
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
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold ${
                      item.status === "completed"
                        ? "line-through opacity-60"
                        : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Step {index + 1} of {roadmap.items.length}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item.id, item.status);
                  }}
                  className="ml-2"
                >
                  {item.status === "pending" && "Start"}
                  {item.status === "in_progress" && "Mark Complete"}
                  {item.status === "completed" && "Undo"}
                </Button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3">{item.description}</p>

              {/* Status Badge */}
              <div className="flex justify-end">
                {getStatusBadge(item.status)}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
