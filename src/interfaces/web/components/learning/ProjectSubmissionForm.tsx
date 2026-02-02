"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Github,
  AlertTriangle,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ProjectResultDTO } from "@application/dtos/assessment/SubmitProjectDTO";

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
 *
 * States:
 * - Idle: Input field + Analyze button
 * - Loading: Spinner with progress message
 * - Success: Report card showing score, feedback, strengths, improvements
 * - Error: Error message with Try Again button
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

  // Client-side URL validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roadmapId,
            repoUrl: repoUrl.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle different error codes
        let errorMessage = data.error?.message || "Failed to analyze project";

        if (response.status === 429) {
          errorMessage =
            "GitHub API rate limit exceeded. Please try again in a few minutes or add a GITHUB_ACCESS_TOKEN to your environment.";
        } else if (response.status === 400) {
          errorMessage =
            data.error?.message || "Invalid request. Please check your URL.";
        }

        setError({
          message: errorMessage,
          code: data.error?.code,
        });
        setState("error");
        return;
      }

      // Success
      setResult(data.data);
      setState("success");

      // Notify parent if submission passed
      if (data.data.passed && onSuccess) {
        onSuccess();
      }
    } catch {
      setError({
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      });
      setState("error");
    }
  };

  const handleTryAgain = () => {
    setState("idle");
    setError(null);
    setResult(null);
  };

  // IDLE STATE: Input form
  if (state === "idle" || state === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Submit Your GitHub Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="repo-url"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Repository URL
              </label>
              <Input
                id="repo-url"
                type="url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure your repository is <strong>public</strong> so we can
                analyze it.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {error.message}
                  </p>
                  {error.code && (
                    <p className="text-xs text-red-600 mt-1">
                      Error code: {error.code}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!repoUrl.trim()}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analyze Project
              </Button>
              {state === "error" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTryAgain}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // LOADING STATE: Analyzing spinner
  if (state === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Analyzing Your Code...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Please wait...</strong> This may take 30-60 seconds. We
              are fetching your repository and analyzing the code quality.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // SUCCESS STATE: Report Card
  if (state === "success" && result) {
    const isPassed = result.passed;
    const scoreBgColor = isPassed ? "bg-green-100" : "bg-red-100";
    const scoreBorderColor = isPassed ? "border-green-300" : "border-red-300";

    return (
      <Card className={`border-2 ${scoreBorderColor}`}>
        <CardHeader className={scoreBgColor}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isPassed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {isPassed ? "Project Passed! 🎉" : "Needs Improvement"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Score:</span>
              <Badge
                variant={isPassed ? "default" : "destructive"}
                className={`text-lg font-bold px-3 py-1 ${isPassed ? "bg-green-600" : ""}`}
              >
                {result.score}/100
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {/* Feedback */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Feedback
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {result.feedback}
            </p>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Strengths
              </h3>
              <ul className="space-y-1">
                {result.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {result.improvements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Areas for Improvement
              </h3>
              <ul className="space-y-1">
                {result.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold">⚠</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {!isPassed && (
              <Button
                variant="default"
                onClick={handleTryAgain}
                className="flex-1"
              >
                <Github className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {isPassed && (
              <Button variant="outline" onClick={handleTryAgain}>
                Submit Another
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
