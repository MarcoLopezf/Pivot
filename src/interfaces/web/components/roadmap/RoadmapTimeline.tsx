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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  PlayCircle,
  Github,
  FileText,
} from "lucide-react";
import { VideoCard } from "@/interfaces/web/components/learning/VideoCard";
import { ProjectSubmissionForm } from "@/interfaces/web/components/learning/ProjectSubmissionForm";
import { useItemResources } from "@/interfaces/web/hooks/useItemResources";

export interface RoadmapTimelineProps {
  roadmap: RoadmapDTO;
  onItemStatusChange: (itemId: string, newStatus: RoadmapItemStatus) => void;
  onTakeQuiz?: (itemId: string) => void;
  onProjectSubmitted?: () => void;
}

/**
 * RoadmapItem Sub-Component
 *
 * Individual roadmap item with tabbed interface:
 * - THEORY items: Resources + Quiz tabs
 * - PROJECT items: Instructions + Submit Project tabs
 */
interface RoadmapItemProps {
  item: RoadmapDTO["items"][0];
  roadmapId: string;
  index: number;
  totalItems: number;
  isLastItem: boolean;
  onStatusChange: (itemId: string, newStatus: RoadmapItemStatus) => void;
  onTakeQuiz?: (itemId: string) => void;
  onProjectSubmitted?: () => void;
}

function RoadmapItem({
  item,
  roadmapId,
  index,
  totalItems,
  isLastItem,
  onStatusChange,
  onTakeQuiz,
  onProjectSubmitted,
}: RoadmapItemProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>(
    item.type === "theory" ? "resources" : "instructions",
  );
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

  // Fetch resources when switching to resources tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "resources" && !hasFetched) {
      fetchResources();
    }
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

        {/* Tabbed Interface */}
        <div
          className="mt-4 pt-4 border-t"
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Tab List */}
            <TabsList className="w-full">
              {item.type === "theory" ? (
                <>
                  <TabsTrigger value="resources" className="flex-1">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resources
                    {hasFetched && resources.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {resources.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quiz
                  </TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="instructions" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Instructions
                  </TabsTrigger>
                  <TabsTrigger value="submit" className="flex-1">
                    <Github className="h-4 w-4 mr-2" />
                    Submit Project
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* THEORY TABS */}
            {item.type === "theory" && (
              <>
                {/* Resources Tab */}
                <TabsContent value="resources" className="mt-4">
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
                  {!isLoading &&
                    !error &&
                    resources.length === 0 &&
                    hasFetched && (
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
                </TabsContent>

                {/* Quiz Tab */}
                <TabsContent value="quiz" className="mt-4">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-4">
                      Ready to test your knowledge?
                    </p>
                    {onTakeQuiz && (
                      <Button
                        onClick={() => onTakeQuiz(item.id)}
                        disabled={item.status === "completed"}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {item.status === "completed"
                          ? "Quiz Completed"
                          : "Start Quiz"}
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </>
            )}

            {/* PROJECT TABS */}
            {item.type === "project" && (
              <>
                {/* Instructions Tab */}
                <TabsContent value="instructions" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        📋 Project Requirements
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-amber-900 mb-2">
                        🎯 Expected Skills
                      </h4>
                      <p className="text-sm text-amber-800">{item.topic}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        ✅ Submission Guidelines
                      </h4>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>
                          Your repository must be <strong>public</strong>
                        </li>
                        <li>Include a README with project description</li>
                        <li>Ensure code is well-organized and documented</li>
                        <li>Score ≥70% required to pass</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                {/* Submit Project Tab */}
                <TabsContent value="submit" className="mt-4">
                  <ProjectSubmissionForm
                    roadmapId={roadmapId}
                    roadmapItemId={item.id}
                    onSuccess={onProjectSubmitted}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
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
  onProjectSubmitted,
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
            roadmapId={roadmap.id}
            index={index}
            totalItems={roadmap.items.length}
            isLastItem={index === roadmap.items.length - 1}
            onStatusChange={onItemStatusChange}
            onTakeQuiz={onTakeQuiz}
            onProjectSubmitted={onProjectSubmitted}
          />
        ))}
      </div>
    </div>
  );
}
