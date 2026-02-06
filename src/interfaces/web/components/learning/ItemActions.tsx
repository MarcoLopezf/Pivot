"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoadmapItemStatus } from "@application/dtos/learning/RoadmapDTO";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";
import { CheckCircle2, BookOpen, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ItemActionsProps {
  itemId: string;
  roadmapId: string;
  initialStatus: RoadmapItemStatus;
  itemType: "theory" | "project";
}

/**
 * ItemActions Component (Client)
 *
 * Provides "Mark as Complete" and "Take Quiz" action buttons.
 * Uses optimistic UI for immediate status feedback.
 */
export function ItemActions({
  itemId,
  roadmapId,
  initialStatus,
  itemType,
}: ItemActionsProps): React.ReactElement {
  const [status, setStatus] = useState<RoadmapItemStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkComplete = useCallback(async (): Promise<void> => {
    const previousStatus = status;
    const newStatus: RoadmapItemStatus =
      status === "completed" ? "in_progress" : "completed";

    // Optimistic update
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await roadmapApi.updateItemStatus(roadmapId, itemId, newStatus);
      toast.success(
        newStatus === "completed"
          ? "Marked as complete!"
          : "Marked as in progress",
      );
    } catch (err) {
      // Revert on failure
      setStatus(previousStatus);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [status, roadmapId, itemId]);

  const handleStart = useCallback(async (): Promise<void> => {
    setStatus("in_progress");
    setIsUpdating(true);

    try {
      await roadmapApi.updateItemStatus(roadmapId, itemId, "in_progress");
      toast.success("Started learning!");
    } catch (err) {
      setStatus("pending");
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [roadmapId, itemId]);

  return (
    <div className="space-y-3">
      {/* Status-dependent primary action */}
      {status === "pending" && (
        <Button
          onClick={handleStart}
          disabled={isUpdating}
          className="w-full gap-2"
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
          Start Learning
        </Button>
      )}

      {status === "in_progress" && (
        <Button
          onClick={handleMarkComplete}
          disabled={isUpdating}
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Mark as Complete
        </Button>
      )}

      {status === "completed" && (
        <Button
          onClick={handleMarkComplete}
          disabled={isUpdating}
          variant="outline"
          className="w-full gap-2 border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Completed - Undo
        </Button>
      )}

      {/* Take Quiz button (theory items only) */}
      {itemType === "theory" && (
        <Link href={`/quiz/${roadmapId}/${itemId}`}>
          <Button
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={status === "pending"}
          >
            <BookOpen className="h-4 w-4" />
            Take Quiz
          </Button>
        </Link>
      )}
    </div>
  );
}
