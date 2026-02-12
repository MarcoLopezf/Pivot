"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Diamond,
  ChevronRight,
  Trophy,
  XCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import type {
  QuizDTO,
  QuizQuestionDTO,
} from "@application/dtos/assessment/QuizDTO";
import type { QuizResultDTO } from "@application/dtos/assessment/SubmitQuizDTO";

interface KnowledgeCheckProps {
  roadmapId: string;
  itemId: string;
}

type QuizState =
  | "idle"
  | "loading"
  | "ready"
  | "submitting"
  | "result"
  | "error";

const OPTION_LABELS = ["A", "B", "C", "D"];

/**
 * KnowledgeCheck Component
 *
 * Inline quiz with one question at a time, 2x2 grid options,
 * and submit functionality. Designed for theory lesson pages.
 */
export function KnowledgeCheck({
  roadmapId,
  itemId,
}: KnowledgeCheckProps): React.ReactElement {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [quiz, setQuiz] = useState<QuizDTO | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion: QuizQuestionDTO | undefined =
    quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length ?? 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const fetchQuiz = useCallback(async (): Promise<void> => {
    setQuizState("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/learning/roadmap/items/${itemId}/quiz?roadmapId=${roadmapId}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to load quiz");
      }

      const data = await response.json();
      setQuiz(data.data);
      setQuizState("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setQuizState("error");
    }
  }, [roadmapId, itemId]);

  const handleOptionSelect = useCallback((optionId: string): void => {
    setSelectedOption(optionId);
  }, []);

  const submitQuiz = useCallback(
    async (answers: Record<string, string>): Promise<void> => {
      setQuizState("submitting");

      try {
        const formattedAnswers = Object.entries(answers).map(
          ([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          }),
        );

        const response = await fetch(
          `/api/learning/roadmap/items/${itemId}/quiz`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roadmapId, answers: formattedAnswers }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to submit quiz");
        }

        const data = await response.json();
        setQuizResult(data.data);
        setQuizState("result");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit quiz");
        setQuizState("error");
      }
    },
    [roadmapId, itemId],
  );

  const handleNext = useCallback((): void => {
    if (!currentQuestion || !selectedOption) return;

    // Save answer
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: selectedOption,
    };
    setSelectedAnswers(updatedAnswers);
    setSelectedOption(null);

    if (isLastQuestion) {
      void submitQuiz(updatedAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentQuestion,
    selectedOption,
    selectedAnswers,
    isLastQuestion,
    submitQuiz,
  ]);

  const handleRetry = useCallback((): void => {
    setQuiz(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSelectedOption(null);
    setQuizResult(null);
    setError(null);
    void fetchQuiz();
  }, [fetchQuiz]);

  // Idle state - show start button
  if (quizState === "idle") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FCDAB7]/20 mb-4">
          <Diamond className="h-6 w-6 text-[#FCDAB7]" />
        </div>
        <h2 className="text-xl font-bold text-[#1D2D50] mb-2">
          Knowledge Check
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Test your understanding of this module
        </p>
        <Button
          onClick={() => void fetchQuiz()}
          className="bg-[#1D2D50] hover:bg-[#152340] text-white"
        >
          Start Quiz
        </Button>
      </div>
    );
  }

  // Loading state
  if (quizState === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3 mb-6">
          <Diamond className="h-5 w-5 text-[#FCDAB7]" />
          <h2 className="text-xl font-bold text-[#1D2D50]">Knowledge Check</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E5F74] mb-3" />
          <p className="text-sm text-slate-500">Preparing your questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quizState === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Diamond className="h-5 w-5 text-red-400" />
          <h2 className="text-xl font-bold text-red-900">Knowledge Check</h2>
        </div>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Result state
  if (quizState === "result" && quizResult) {
    return (
      <div
        className={`rounded-xl border p-8 ${
          quizResult.passed
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
            : "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <Diamond className="h-5 w-5 text-[#FCDAB7]" />
          <h2 className="text-xl font-bold text-[#1D2D50]">Knowledge Check</h2>
        </div>

        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            {quizResult.passed ? (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            )}
          </div>

          <h3
            className={`text-2xl font-bold mb-1 ${
              quizResult.passed ? "text-green-900" : "text-orange-900"
            }`}
          >
            {quizResult.passed ? "Great job!" : "Keep Learning!"}
          </h3>

          <div
            className={`inline-block text-4xl font-bold my-3 ${
              quizResult.passed ? "text-green-700" : "text-orange-700"
            }`}
          >
            {quizResult.score}%
          </div>

          <p
            className={`text-sm mb-1 ${
              quizResult.passed ? "text-green-600" : "text-orange-600"
            }`}
          >
            {quizResult.correctCount} of {quizResult.totalCount} correct
          </p>

          <p
            className={`text-sm mt-3 ${
              quizResult.passed ? "text-green-700" : "text-orange-700"
            }`}
          >
            {quizResult.feedback}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            {!quizResult.passed && (
              <Button
                onClick={handleRetry}
                className="bg-[#1D2D50] hover:bg-[#152340] text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {quizResult.passed && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Module complete</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz active state - show current question
  if (
    quizState === "submitting" ||
    (quizState === "ready" && currentQuestion)
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Diamond className="h-5 w-5 text-[#FCDAB7]" />
          <h2 className="text-xl font-bold text-[#1D2D50]">Knowledge Check</h2>
        </div>

        {/* Question */}
        {currentQuestion && (
          <>
            <p className="text-base font-medium text-slate-900 mb-6">
              {currentQuestion.text}
            </p>

            {/* Options Grid 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={quizState === "submitting"}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-[#1E5F74] bg-[#1E5F74]/5 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    } ${quizState === "submitting" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-[#1E5F74] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {OPTION_LABELS[index]}
                    </span>
                    <span className="text-sm text-slate-700 pt-0.5">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer: Question counter + Submit */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-400">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
              <Button
                onClick={handleNext}
                disabled={!selectedOption || quizState === "submitting"}
                className="bg-[#FCDAB7] hover:bg-[#f5c9a0] text-slate-900 font-medium"
              >
                {quizState === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : isLastQuestion ? (
                  "Submit Answer"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Fallback
  return <></>;
}
