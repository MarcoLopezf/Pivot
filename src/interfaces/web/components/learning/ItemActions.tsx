"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RoadmapItemStatus } from "@application/dtos/learning/RoadmapDTO";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";
import { CheckCircle2, BookOpen, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ItemActionsProps {
  itemId: string;
  roadmapId: string;
  initialStatus: RoadmapItemStatus;
}

/**
 * ItemActions Component (Client)
 *
 * Provides status action buttons (Start Learning, Mark as Complete, Undo).
 * Status only updates after API success to avoid flash of wrong button.
 */
export function ItemActions({
  itemId,
  roadmapId,
  initialStatus,
}: ItemActionsProps): React.ReactElement {
  const [status, setStatus] = useState<RoadmapItemStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(
    async (newStatus: RoadmapItemStatus): Promise<void> => {
      setIsUpdating(true);

      try {
        await roadmapApi.updateItemStatus(roadmapId, itemId, newStatus);
        setStatus(newStatus);
        toast.success(
          newStatus === "completed"
            ? "Marked as complete!"
            : newStatus === "in_progress"
              ? "Started learning!"
              : "Marked as in progress",
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update status";
        toast.error(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [roadmapId, itemId],
  );

  return (
    <div className="space-y-3">
      {status === "pending" && (
        <Button
          onClick={() => void updateStatus("in_progress")}
          disabled={isUpdating}
          className="w-full gap-2"
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
          {isUpdating ? "Starting..." : "Start Learning"}
        </Button>
      )}

      {status === "in_progress" && (
        <Button
          onClick={() => void updateStatus("completed")}
          disabled={isUpdating}
          className="w-full gap-2 bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isUpdating ? "Updating..." : "Mark as Complete"}
        </Button>
      )}

      {status === "completed" && (
        <Button
          onClick={() => void updateStatus("in_progress")}
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
    </div>
  );
}
