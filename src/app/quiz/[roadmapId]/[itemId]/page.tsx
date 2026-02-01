"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { QuizDTO } from "@application/dtos/assessment/QuizDTO";

/**
 * Quiz Page
 *
 * Displays a quiz for a specific roadmap item (theory type only).
 * - Fetches quiz questions from the API
 * - Shows multiple-choice questions with 4 options each
 * - Allows user to select answers
 * - Submit functionality (TODO: Day 17 - Quiz Validation)
 */
export default function QuizPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const roadmapId = params.roadmapId as string;
  const itemId = params.itemId as string;

  const [quiz, setQuiz] = React.useState<QuizDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = React.useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch quiz on mount
  React.useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/learning/roadmap/items/${itemId}/quiz?roadmapId=${roadmapId}`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to load quiz questions",
          );
        }

        const data = await response.json();
        setQuiz(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (roadmapId && itemId) {
      void fetchQuiz();
    }
  }, [roadmapId, itemId]);

  // Handle answer selection
  const handleAnswerChange = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Handle quiz submission (TODO: Implement in Day 17)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Call API to validate answers and record quiz attempt
    // For now, just show an alert
    alert(
      `Quiz submission coming soon!\n\nSelected answers: ${Object.keys(selectedAnswers).length}/${quiz?.questions.length || 0}`,
    );
    setIsSubmitting(false);
  };

  // Check if all questions are answered
  const allQuestionsAnswered =
    quiz && Object.keys(selectedAnswers).length === quiz.questions.length;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Loading Quiz...
            </CardTitle>
            <CardDescription>Preparing your assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Error Loading Quiz</CardTitle>
            </div>
            <CardDescription className="text-red-800">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-red-300 text-red-900 hover:bg-red-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-900 hover:bg-red-100"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No quiz found
  if (!quiz) {
    return (
      <div className="container mx-auto p-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Quiz Not Found</CardTitle>
            <CardDescription>
              Unable to load quiz for this roadmap item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - display quiz
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{quiz.title}</CardTitle>
              <CardDescription className="mt-2">
                {quiz.questions.length} questions • {quiz.difficulty} level
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Quiz Questions */}
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="p-6 border rounded-lg bg-gray-50 space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-900">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {question.text}
                  </h3>
                </div>
                {selectedAnswers[question.id] && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={selectedAnswers[question.id] || ""}
                onValueChange={(value) =>
                  handleAnswerChange(question.id, value)
                }
                className="space-y-3 ml-11"
              >
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-white transition-colors"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer text-gray-700"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          {/* Submit Section */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              {Object.keys(selectedAnswers).length} of {quiz.questions.length}{" "}
              questions answered
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
