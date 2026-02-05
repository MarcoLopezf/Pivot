"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StepContainer } from "@/interfaces/web/components/onboarding/StepContainer";
import { useOnboardingStore } from "@/interfaces/web/stores/useOnboardingStore";
import { getRoleSuggestionsAction } from "@/interfaces/web/actions/learningActions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, FileText, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Step4Discovery - Onboarding Step 4: Discovery Goals
 *
 * For users who chose the DISCOVERY path.
 * Collects interests and preferences to help suggest suitable career paths:
 * - Topics/skills that interest them
 * - Topics/skills they want to avoid (optional)
 *
 * In the future, this will trigger an AI suggestion flow.
 * For now, it converges to the roadmap preview step.
 *
 * @layer Interface (Web)
 */

// Validation schema
const discoveryGoalsSchema = z.object({
  interests: z
    .string()
    .min(10, "Please provide at least 10 characters describing your interests")
    .max(500, "Interests must be less than 500 characters"),
  dislike: z
    .string()
    .max(500, "Dislikes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  cvFile: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size === 0 || file.type === "application/pdf",
      "CV must be a PDF file",
    )
    .refine(
      (file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024,
      "CV file must be less than 5MB",
    )
    .optional(),
});

type DiscoveryGoalsFormValues = z.infer<typeof discoveryGoalsSchema>;

/**
 * Role suggestion from AI
 */
interface RoleSuggestion {
  role: string;
  matchPercentage: number;
  reasoning: string;
}

export function Step4Discovery() {
  const {
    data,
    updateData,
    saveCurrentStep,
    nextStep,
    previousStep,
    isLoading,
  } = useOnboardingStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<RoleSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSelectingRole, setIsSelectingRole] = useState(false);

  // Initialize form with store values
  const form = useForm<DiscoveryGoalsFormValues>({
    resolver: zodResolver(discoveryGoalsSchema),
    defaultValues: {
      interests: (data.interests as string) || "",
      dislike: (data.dislike as string) || "",
    },
  });

  /**
   * Handles "Get AI Suggestions" button click
   * Calls getRoleSuggestionsAction with interests and optional CV file
   */
  const handleGetSuggestions = async (): Promise<void> => {
    const interests = form.getValues("interests");
    const cvFile = form.getValues("cvFile");

    if (!interests || interests.trim().length < 10) {
      toast.error(
        "Please describe your interests first (at least 10 characters)",
      );
      return;
    }

    setIsAnalyzing(true);
    setShowSuggestions(true);

    try {
      // Build FormData with interests and optional CV file
      const formData = new FormData();
      formData.append("interests", interests);

      if (cvFile && cvFile.size > 0) {
        formData.append("cvFile", cvFile);
      }
      // Call server action to get AI suggestions
      const result = await getRoleSuggestionsAction(formData);

      if (!result.success) {
        toast.error("Failed to get suggestions", {
          description: result.error || "Please try again",
        });
        return;
      }

      // Update suggestions state
      setSuggestions(result.data || []);
      toast.success("AI suggestions generated!", {
        description: "Review the suggested career paths below",
      });
    } catch (error) {
      console.error("Error getting role suggestions:", error);
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handles role selection from AI suggestions
   * Saves the selected role and advances to next step
   */
  const handleSelectRole = async (role: string): Promise<void> => {
    setIsSelectingRole(true);

    try {
      // Update store with selected role and interests
      updateData({
        targetRole: role,
        interests: form.getValues("interests"),
      });

      // Save progress to server
      await saveCurrentStep();

      // Show success toast
      toast.success("Role selected!", {
        description: `${role} - Moving to next step`,
      });

      // Navigate to next step (Import CV)
      setTimeout(() => {
        nextStep();
      }, 800);
    } catch (error) {
      console.error("Error selecting role:", error);
      toast.error("Failed to save selection", {
        description: "Please try again",
      });
      setIsSelectingRole(false);
    }
  };

  /**
   * Handles form submission (manual path without AI suggestions)
   * Updates store data, saves progress, and navigates to next step (Import)
   */
  const onSubmit = async (values: DiscoveryGoalsFormValues): Promise<void> => {
    try {
      // Update store with form data (excluding cvFile which is already saved if uploaded)
      const { cvFile, ...dataToSave } = values;
      updateData(dataToSave);

      // Save progress to server
      await saveCurrentStep();

      // Navigate to next step (Import CV)
      nextStep();
    } catch (error) {
      console.error("Error saving discovery goals:", error);
      toast.error("Failed to save progress", {
        description: "Please try again",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepContainer
          title="Tell us about your interests"
          description="Help us understand what excites you so we can suggest the best career paths."
          onNext={form.handleSubmit(onSubmit)}
          onBack={previousStep}
          isNextDisabled={!form.formState.isValid}
          isLoading={isLoading || isSelectingRole}
          nextLabel={
            showSuggestions && suggestions.length > 0
              ? "Or continue with general interests"
              : "Discover My Path"
          }
        >
          <div className="space-y-6">
            {/* Interests Field */}
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What topics interest you?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Artificial Intelligence, Web Design, Data Analysis, Mobile Apps, Cybersecurity, Creative Writing..."
                      className="resize-none"
                      rows={5}
                      {...field}
                      disabled={isLoading || isAnalyzing}
                    />
                  </FormControl>
                  <FormDescription>
                    List technologies, fields, or skills that excite you. Be as
                    specific or broad as you like.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional CV Upload for Better Suggestions */}
            <FormField
              control={form.control}
              name="cvFile"
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload CV for Better Suggestions (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf"
                      disabled={isLoading || isAnalyzing}
                      className="cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-purple-700"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file || new File([], ""));
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Upload your CV to get personalized suggestions based on your
                    experience (PDF, max 5MB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Get AI Suggestions Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGetSuggestions}
                disabled={isAnalyzing || isLoading || !form.watch("interests")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                {isAnalyzing
                  ? "Reading CV & Analyzing..."
                  : "Get AI Suggestions"}
              </button>
            </div>

            {/* AI Suggestions Display */}
            {showSuggestions && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-medium">
                    AI-Recommended Career Paths
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click on a card to select your target role
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-gray-200 p-4"
                      >
                        <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-20 w-full rounded bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    {suggestions.map((suggestion, index) => (
                      <Card
                        key={index}
                        onClick={() => handleSelectRole(suggestion.role)}
                        className="group relative cursor-pointer border-2 border-purple-200 transition-all hover:scale-105 hover:border-purple-500 hover:bg-purple-50 hover:shadow-xl"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {suggestion.role}
                          </CardTitle>
                          <CardDescription className="text-base font-semibold text-purple-600">
                            <CheckCircle className="mr-1 inline h-4 w-4" />
                            {suggestion.matchPercentage}% Match
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            {suggestion.reasoning}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                            disabled={isSelectingRole}
                          >
                            Select this path
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dislikes Field (Optional) - Hidden for now */}
            {/* <FormField
              control={form.control}
              name="dislike"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you want to avoid? (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Legacy code, Sales-heavy roles, High-pressure environments..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={isLoading || isAnalyzing}
                    />
                  </FormControl>
                  <FormDescription>
                    Any topics, technologies, or work styles you&apos;d prefer
                    to stay away from?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Info Box */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
              <p className="font-medium">How This Works</p>
              <p className="mt-1">
                {data.resumeText
                  ? "We'll use your CV context to create a personalized roadmap in the next step."
                  : "Our AI will analyze your interests to suggest career paths that align with your preferences."}
              </p>
            </div>
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
