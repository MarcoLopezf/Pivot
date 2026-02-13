"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Github,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { ProjectResultDTO } from "@application/dtos/assessment/SubmitProjectDTO";
import * as roadmapApi from "@interfaces/web/api/roadmapApi";

interface ProjectSubmissionFormProps {
  roadmapId: string;
  roadmapItemId: string;
  onSuccess?: () => void;
}

type SubmissionState = "idle" | "loading" | "success" | "error";

interface ErrorState {
  message: string;
  code?: string;
}

/**
 * ProjectSubmissionForm Component
 *
 * Allows users to submit GitHub repository URLs for project validation.
 * Restyled to match the project lesson design (inline, no card wrapper).
 *
 * States:
 * - Idle: Input + cream submit button
 * - Loading: Skeleton + progress text
 * - Success: Compact report card (score, feedback, strengths, improvements)
 * - Error: Inline error message under input
 */
export function ProjectSubmissionForm({
  roadmapId,
  roadmapItemId,
  onSuccess,
}: ProjectSubmissionFormProps): React.ReactElement | null {
  const [repoUrl, setRepoUrl] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [result, setResult] = useState<ProjectResultDTO | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const isValidGitHubUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === "https:" &&
        parsed.hostname === "github.com" &&
        parsed.pathname.split("/").filter(Boolean).length >= 2
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!isValidGitHubUrl(repoUrl)) {
      setError({
        message:
          "Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)",
        code: "INVALID_URL",
      });
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/learning/roadmap/items/${roadmapItemId}/project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roadmapId, repoUrl: repoUrl.trim() }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error?.message || "Failed to analyze project";

        if (response.status === 429) {
          errorMessage =
            "GitHub API rate limit exceeded. Please try again in a few minutes.";
        } else if (response.status === 400) {
          errorMessage =
            data.error?.message || "Invalid request. Please check your URL.";
        }

        setError({ message: errorMessage, code: data.error?.code });
        setState("error");
        return;
      }

      setResult(data.data);
      setState("success");

      // Auto-mark item as completed when project passes
      if (data.data.passed) {
        try {
          await roadmapApi.updateItemStatus(
            roadmapId,
            roadmapItemId,
            "completed",
          );
        } catch {
          // Silent fail — item status is secondary to showing results
        }
        onSuccess?.();
      }
    } catch {
      setError({
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      });
      setState("error");
    }
  };

  const handleTryAgain = (): void => {
    setState("idle");
    setError(null);
    setResult(null);
  };

  // IDLE / ERROR STATE
  if (state === "idle" || state === "error") {
    return (
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <Input
          id="repo-url"
          type="url"
          placeholder="GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full border-slate-200 text-sm"
        />

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!repoUrl.trim()}
          className="w-full bg-[#FCDAB7] text-slate-900 hover:bg-[#f5c9a0] font-semibold uppercase tracking-wide"
        >
          Submit Project
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </form>
    );
  }

  // LOADING STATE
  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E5F74]" />
        <p className="text-xs text-slate-500">
          Analyzing your code... This may take 30-60 seconds.
        </p>
      </div>
    );
  }

  // SUCCESS STATE — Compact report card
  if (state === "success" && result) {
    const isPassed = result.passed;

    return (
      <div
        className={`rounded-lg border-2 overflow-hidden ${isPassed ? "border-green-200" : "border-red-200"}`}
      >
        {/* Score header */}
        <div
          className={`px-4 py-3 flex items-center justify-between ${isPassed ? "bg-green-50" : "bg-red-50"}`}
        >
          <div className="flex items-center gap-2">
            {isPassed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-semibold text-slate-900">
              {isPassed ? "Project Passed!" : "Needs Improvement"}
            </span>
          </div>
          <Badge
            variant={isPassed ? "default" : "destructive"}
            className={`text-xs font-bold ${isPassed ? "bg-green-600" : ""}`}
          >
            {result.score}/100
          </Badge>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.feedback}
          </p>

          {result.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-0.5">
                {result.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-600 flex items-start gap-1.5"
                  >
                    <span className="text-green-600">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.improvements.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Improvements
              </h4>
              <ul className="space-y-0.5">
                {result.improvements.map((imp, i) => (
                  <li
                    key={i}
                    className="text-xs text-slate-600 flex items-start gap-1.5"
                  >
                    <span className="text-amber-600">⚠</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action */}
          <div className="pt-2 border-t border-slate-200">
            <Button
              size="sm"
              onClick={handleTryAgain}
              className="w-full bg-[#1D2D50] hover:bg-[#152340] text-white"
            >
              {isPassed ? (
                "Submit Another"
              ) : (
                <>
                  <Github className="h-3.5 w-3.5 mr-1.5" />
                  Submit Again
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
