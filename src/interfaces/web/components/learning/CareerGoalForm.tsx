"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Zod schema for career goal form with optional personalization fields
 */
const careerGoalFormSchema = z.object({
  currentRole: z
    .string()
    .min(1, "Current role is required")
    .min(2, "Current role must be at least 2 characters"),
  targetRole: z
    .string()
    .min(1, "Target role is required")
    .min(2, "Target role must be at least 2 characters"),
  experienceSummary: z.string().optional(),
  cvFile: z
    .instanceof(File)
    .refine(
      (file) => !file || file.type === "application/pdf",
      "CV must be a PDF file",
    )
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "CV file must be less than 5MB",
    )
    .optional(),
});

type CareerGoalFormValues = z.infer<typeof careerGoalFormSchema>;

/**
 * API Response Types
 */
interface RoleSuggestion {
  role: string;
  matchPercentage: number;
  reasoning: string;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * CareerGoalForm Component Props
 */
interface CareerGoalFormProps {
  userId: string;
  defaultSkills?: string[];
}

/**
 * CareerGoalForm Component
 *
 * Client component for setting career goals with AI-powered suggestions.
 * Two modes:
 * 1. Manual: User enters current and target roles directly
 * 2. AI Suggested: User gets AI-generated role suggestions based on their profile
 */
export function CareerGoalForm({
  userId,
  defaultSkills = [],
}: CareerGoalFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<RoleSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const form = useForm<CareerGoalFormValues>({
    resolver: zodResolver(careerGoalFormSchema),
    defaultValues: {
      currentRole: "",
      targetRole: "",
      experienceSummary: "",
    },
  });

  /**
   * Fetch AI-powered role suggestions
   */
  const handleGetSuggestions = async (): Promise<void> => {
    const currentRole = form.getValues("currentRole");

    if (!currentRole || currentRole.trim().length === 0) {
      toast.error("Please enter your current role first");
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      const response = await fetch("/api/learning/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentRole,
          skills:
            defaultSkills.length > 0
              ? defaultSkills
              : ["JavaScript", "TypeScript", "React"], // Fallback skills
        }),
      });

      const data: ApiSuccessResponse<RoleSuggestion[]> | ApiErrorResponse =
        await response.json();

      if (!response.ok || !data.success) {
        const errorData = data as ApiErrorResponse;
        toast.error("Failed to get suggestions", {
          description: errorData.error.message,
        });
        return;
      }

      const successData = data as ApiSuccessResponse<RoleSuggestion[]>;
      setSuggestions(successData.data);
      toast.success("AI suggestions generated!", {
        description: "Click on a card to select your target role",
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  /**
   * Handle clicking a suggestion card
   */
  const handleSelectSuggestion = (role: string): void => {
    form.setValue("targetRole", role);
    toast.success("Target role selected", {
      description: `You selected: ${role}`,
    });
  };

  /**
   * Submit the career goal and generate personalized roadmap
   */
  const onSubmit = async (values: CareerGoalFormValues): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Show loading toast with AI generation message
      const loadingToast = toast.loading("Analyzing your experience...", {
        description: "Generating your personalized roadmap with AI",
      });

      // Build FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("currentRole", values.currentRole);
      formData.append("targetRole", values.targetRole);

      if (values.experienceSummary) {
        formData.append("experienceSummary", values.experienceSummary);
      }

      if (values.cvFile) {
        formData.append("cvFile", values.cvFile);
      }

      const response = await fetch("/api/learning/goals", {
        method: "POST",
        body: formData, // No Content-Type header - browser sets it with boundary
      });

      const data: ApiSuccessResponse<unknown> | ApiErrorResponse =
        await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok || !data.success) {
        const errorData = data as ApiErrorResponse;

        // Special handling for roadmap generation failure
        if (errorData.error.code === "ROADMAP_GENERATION_FAILED") {
          toast.warning("Goal saved, but roadmap generation failed", {
            description:
              "Your career goal was saved successfully, but we couldn't generate your roadmap. Please try again from the roadmap page.",
            duration: 5000,
          });
          // Still redirect to roadmap page (will show empty state with retry)
          setTimeout(() => {
            router.push("/onboarding/roadmap");
          }, 2000);
          return;
        }

        toast.error("Failed to save career goal", {
          description: errorData.error.message,
        });
        return;
      }

      // Success - both goal and roadmap created
      toast.success("Career goal saved!", {
        description: "Your personalized roadmap has been generated with AI ✨",
        duration: 3000,
      });

      // Redirect to roadmap page
      setTimeout(() => {
        router.push("/onboarding/roadmap");
      }, 1500);
    } catch (error) {
      console.error("Error submitting career goal:", error);
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="currentRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Role</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Junior Backend Developer"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* AI Suggestions Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetSuggestions}
              disabled={isLoadingSuggestions || isSubmitting}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isLoadingSuggestions
                ? "Analyzing with AI..."
                : "Get AI Suggestions"}
            </Button>
          </div>

          {/* AI Suggestions Display */}
          {showSuggestions && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-center">
                AI-Recommended Career Paths
              </h3>

              {isLoadingSuggestions ? (
                // Loading skeletons
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Actual suggestions
                <div className="grid gap-4 md:grid-cols-3">
                  {suggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer transition-all hover:border-primary hover:shadow-lg"
                      onClick={() => handleSelectSuggestion(suggestion.role)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {suggestion.role}
                        </CardTitle>
                        <CardDescription className="text-base font-semibold text-primary">
                          {suggestion.matchPercentage}% Match
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reasoning}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="targetRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Role</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Senior Backend Developer"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personalization Section */}
          <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Personalize Your Roadmap (Optional)
              </h3>
            </div>
            <p className="text-sm text-blue-700">
              Help our AI understand your experience to create a more accurate
              roadmap. Items you already know will be marked as completed!
            </p>

            <FormField
              control={form.control}
              name="experienceSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 3 years with React and TypeScript, built full-stack apps with Node.js..."
                      disabled={isSubmitting}
                      rows={4}
                      className="resize-none bg-white text-gray-900 placeholder:text-gray-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Describe your technical background, key skills, and relevant
                    projects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvFile"
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload CV (PDF, max 5MB)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf"
                      disabled={isSubmitting}
                      className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      ref={fieldProps.ref}
                      name={fieldProps.name}
                      onBlur={fieldProps.onBlur}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Our AI will analyze your CV to identify your skills and
                    customize your learning path
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            <Target className="h-4 w-4" />
            {isSubmitting
              ? "Generating your personalized roadmap..."
              : "Continue to Roadmap"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
