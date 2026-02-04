"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@interfaces/web/actions/onboarding";
import { Button } from "@/components/ui/button";

/**
 * Step5Generating - Final Onboarding Step
 *
 * Triggers the completion of onboarding by:
 * 1. Finalizing user profile
 * 2. Creating career goal
 * 3. Generating AI-powered roadmap
 * 4. Redirecting to dashboard
 *
 * Shows animated loading states during processing.
 *
 * @layer Interface (Web)
 */
export function Step5Generating() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "initializing" | "processing" | "generating" | "complete" | "error"
  >("initializing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCompletion();
  }, []);

  const handleCompletion = async () => {
    try {
      // Step 1: Finalizing profile
      setStatus("initializing");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 2: Setting goals
      setStatus("processing");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Generate roadmap (this is the actual API call)
      setStatus("generating");
      const result = await completeOnboardingAction();

      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }

      // Step 4: Complete
      setStatus("complete");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to dashboard
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus("initializing");
    handleCompletion();
  };

  const getStatusMessage = () => {
    switch (status) {
      case "initializing":
        return {
          title: "Finalizing your profile...",
          description: "Setting up your learning environment",
          emoji: "👤",
        };
      case "processing":
        return {
          title: "Setting your goals...",
          description: "Preparing your career objectives",
          emoji: "🎯",
        };
      case "generating":
        return {
          title: "AI is crafting your roadmap...",
          description:
            "Analyzing your goals and generating a personalized learning path",
          emoji: "🤖",
        };
      case "complete":
        return {
          title: "All set!",
          description: "Redirecting to your dashboard...",
          emoji: "✅",
        };
      case "error":
        return {
          title: "Something went wrong",
          description: error || "Please try again",
          emoji: "❌",
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Generating Your Learning Path
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we create your personalized roadmap
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Animated Emoji */}
        <div
          className={`text-8xl ${status === "error" ? "" : "animate-bounce"}`}
        >
          {statusInfo.emoji}
        </div>

        {/* Status Message */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            {statusInfo.title}
          </h3>
          <p className="mt-2 text-gray-600">{statusInfo.description}</p>
        </div>

        {/* Loading Bar (only show when not complete or error) */}
        {status !== "complete" && status !== "error" && (
          <div className="w-full max-w-md">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full animate-pulse bg-blue-600 transition-all duration-1000"
                style={{
                  width:
                    status === "initializing"
                      ? "33%"
                      : status === "processing"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
          </div>
        )}

        {/* Error State - Retry Button */}
        {status === "error" && (
          <Button onClick={handleRetry} size="lg" className="mt-4">
            Try Again
          </Button>
        )}

        {/* Loading Spinner */}
        {status === "generating" && (
          <div className="mt-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
}
