"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@interfaces/web/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InfoBox } from "@/interfaces/web/components/onboarding/InfoBox";
import { BrainCircuit, Sparkles, RefreshCw } from "lucide-react";

/**
 * Step7Generating - Final Onboarding Step (7 of 7)
 *
 * Triggers the completion of onboarding by:
 * 1. Finalizing user profile
 * 2. Creating career goal
 * 3. Generating AI-powered roadmap
 * 4. Redirecting to dashboard
 *
 * Two-column layout with rotating status phrases and emojis
 * to communicate what the AI is doing behind the scenes.
 *
 * @layer Interface (Web)
 */

/** Rotating phrases that describe AI processing steps */
const GENERATING_PHRASES = [
  { text: "Finalizing your profile...", emoji: "👤" },
  { text: "Setting your career goals...", emoji: "🎯" },
  { text: "Analyzing your skill gaps...", emoji: "🔍" },
  { text: "Finding the best learning resources...", emoji: "📚" },
  { text: "Mapping out milestones and projects...", emoji: "🗺️" },
  { text: "Crafting your personalized roadmap...", emoji: "🤖" },
  { text: "Fine-tuning recommendations...", emoji: "⚡" },
  { text: "Almost there...", emoji: "✨" },
];

/** Interval in ms between phrase rotations */
const PHRASE_INTERVAL = 3500;

export function Step7Generating(): React.ReactElement {
  const router = useRouter();
  const [status, setStatus] = useState<
    "initializing" | "processing" | "generating" | "complete" | "error"
  >("initializing");
  const [error, setError] = useState<string | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const hasRun = useRef(false);

  const handleCompletion = useCallback(async (): Promise<void> => {
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
        // If onboarding session not found, redirect to start
        if (result.error?.includes("session not found")) {
          router.push("/onboarding");
          return;
        }
        throw new Error(result.error || "Failed to complete onboarding");
      }

      // Step 4: Complete
      setStatus("complete");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect — router.refresh() forces Server Components to re-render
      // so SiteHeader picks up the newly created roadmap
      if (result.redirectUrl) {
        router.refresh();
        router.push(result.redirectUrl);
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  }, [router]);

  // Trigger onboarding completion on mount
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      handleCompletion();
    }
  }, [handleCompletion]);

  // Rotate phrases with fade transition
  useEffect(() => {
    if (status === "error" || status === "complete") return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % GENERATING_PHRASES.length);
        setIsFading(false);
      }, 300);
    }, PHRASE_INTERVAL);

    return () => clearInterval(interval);
  }, [status]);

  const handleRetry = (): void => {
    setError(null);
    setStatus("initializing");
    setCurrentPhraseIndex(0);
    hasRun.current = false;
    handleCompletion();
  };

  const isActive = status !== "error" && status !== "complete";
  const currentPhrase = GENERATING_PHRASES[currentPhraseIndex];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      {/* Left Panel - Motivational / AI Visual */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-[#1D2D50] via-[#1D2D50] to-[#133B5C] p-10 text-white min-h-[calc(100vh-4rem)] md:flex md:w-2/5 xl:w-5/12 xl:p-12">
        {/* Top spacer */}
        <div className="flex-shrink-0" />

        {/* Center - Brain Icon + Quote */}
        <div className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
          {/* Brain icon with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-[#1E5F74]/30 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#1E5F74]/60 bg-[#1E5F74]/40">
              <BrainCircuit
                className={`h-12 w-12 text-white ${isActive ? "animate-pulse" : ""}`}
              />
            </div>
          </div>

          {/* Quote */}
          <blockquote className="max-w-xs text-xl font-bold italic leading-relaxed xl:text-2xl">
            &ldquo;Great things take time. Your future is being crafted.&rdquo;
          </blockquote>

          {/* Subtext */}
          <p className="max-w-xs text-sm leading-relaxed text-slate-300">
            Our AI is analyzing thousands of data points to build your unique
            path.
          </p>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            PIVOT AI ENGINE V2.4
          </p>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 py-8 md:px-8 xl:px-12 xl:py-12">
          {/* Progress Indicator */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Step 7 of 7
              </span>
              <span className="text-sm font-semibold text-slate-700">100%</span>
            </div>
            <Progress
              value={100}
              className="h-1.5 bg-slate-200 [&>div]:bg-[#1E5F74]"
            />
          </div>

          {/* Title */}
          <div className="mb-8 space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1D2D50] md:text-3xl">
              Generating Your Learning Path
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Please wait a moment while we personalize your experience.
            </p>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col items-center space-y-8">
            {/* Did you know? Info Box */}
            <div className="w-full">
              <InfoBox icon={Sparkles} title="Did you know?">
                <p>
                  Our AI adapts to your learning speed. Once your path is ready,
                  you can further customize modules or ask the AI to adjust the
                  difficulty level instantly.
                </p>
              </InfoBox>
            </div>

            {/* Active State - Spinner + Rotating Phrases */}
            {isActive && (
              <div className="flex flex-col items-center gap-6 py-8">
                {/* Spinner */}
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-300 border-t-[#1E5F74]" />

                {/* Rotating phrase with emoji */}
                <div
                  className={`flex items-center gap-2 transition-opacity duration-300 ${
                    isFading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="text-lg">{currentPhrase.emoji}</span>
                  <span className="text-sm font-medium text-slate-600">
                    {currentPhrase.text}
                  </span>
                </div>

                {/* Footer hint */}
                <p className="text-xs text-slate-400">
                  We will notify you once it is ready
                </p>
              </div>
            )}

            {/* Complete State */}
            {status === "complete" && (
              <div className="flex flex-col items-center gap-3 py-8">
                <span className="text-5xl">✅</span>
                <p className="text-lg font-semibold text-[#1E5F74]">All set!</p>
                <p className="text-sm text-slate-500">
                  Redirecting to your dashboard...
                </p>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <span className="text-5xl">❌</span>
                <p className="text-lg font-semibold text-slate-900">
                  Something went wrong
                </p>
                <p className="text-sm text-slate-500">
                  {error || "Please try again"}
                </p>
                <Button
                  onClick={handleRetry}
                  className="mt-2 gap-2 bg-[#1D2D50] text-white transition-colors hover:bg-[#152340]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
