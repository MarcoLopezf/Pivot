"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StepContainer } from "@/interfaces/web/components/onboarding/StepContainer";
import { InfoBox } from "@/interfaces/web/components/onboarding/InfoBox";
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
import {
  OnboardingTextarea,
  OnboardingFileInput,
} from "@/interfaces/web/components/onboarding/OnboardingFormComponents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle,
  Info,
} from "lucide-react";
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
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

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

      // Update store with resumeText if CV was uploaded
      if (result.resumeText && result.resumeFileName) {
        updateData({
          resumeText: result.resumeText,
          resumeFileName: result.resumeFileName,
        });
        console.log("✅ Resume text saved to store:", {
          textLength: result.resumeText.length,
          fileName: result.resumeFileName,
        });
      }

      toast.success("AI suggestions generated!", {
        description: "Review the suggested career paths below",
      });
    } catch (error) {
      console.error("Error getting role suggestions:", error);
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
      // Reset suggestions UI to allow retry
      setShowSuggestions(false);
      setSuggestions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handles role selection from AI suggestions
   * Marks the role as selected (doesn't advance yet)
   */
  const handleSelectRole = (role: string): void => {
    setSelectedRole(role);
  };

  /**
   * Handles form submission
   * Saves selected role (if any) and advances to next step
   */
  const onSubmit = async (values: DiscoveryGoalsFormValues): Promise<void> => {
    try {
      // Update store with form data (excluding cvFile which is already saved if uploaded)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cvFile, ...dataToSave } = values;

      // If a role was selected from suggestions, include it
      const dataWithRole = selectedRole
        ? { ...dataToSave, targetRole: selectedRole }
        : dataToSave;

      // Preserve resumeText and resumeFileName if they exist (from CV upload)
      const finalData = {
        ...dataWithRole,
        ...(data.resumeText && { resumeText: data.resumeText }),
        ...(data.resumeFileName && { resumeFileName: data.resumeFileName }),
      };

      updateData(finalData);

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
          currentStep={4}
          title="Tell us about your interests"
          description="Help us understand what excites you so we can suggest the best career paths."
          quote="The best way to predict the future is to create it. Your path in tech starts with the first step."
          quoteAuthor="INNOVATION MANTRA"
          onNext={form.handleSubmit(onSubmit)}
          onBack={previousStep}
          isNextDisabled={!selectedRole}
          isLoading={isLoading}
          nextLabel={
            selectedRole
              ? "Continue with this role"
              : "Select a role to continue"
          }
        >
          <div className="space-y-6">
            {/* Interests Field */}
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">
                    What topics interest you?
                  </FormLabel>
                  <FormControl>
                    <OnboardingTextarea
                      placeholder="E.g., Artificial Intelligence, Web Design, Data Analysis, Mobile Apps, Cybersecurity, Creative Writing..."
                      className="resize-none"
                      rows={5}
                      {...field}
                      disabled={isLoading || isAnalyzing}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
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
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { onChange, value, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                    Upload CV for Better Suggestions (Optional)
                  </FormLabel>
                  <FormControl>
                    <OnboardingFileInput
                      accept=".pdf"
                      disabled={isLoading || isAnalyzing}
                      selectedFileName={selectedFileName}
                      onFileChange={(file) => {
                        if (file) {
                          setSelectedFileName(file.name);
                          onChange(file);
                        } else {
                          setSelectedFileName("");
                          onChange(new File([], ""));
                        }
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500">
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
                className="flex items-center gap-2 rounded-lg bg-[#FCDAB7] px-6 py-3 font-semibold text-slate-900 shadow-lg transition-colors hover:bg-[#f5c9a0] disabled:cursor-not-allowed disabled:opacity-50"
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
                  <h3 className="text-sm font-medium text-slate-900">
                    AI-Recommended Career Paths
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedRole
                      ? "Selection made! Click the button below to continue"
                      : "Click on a card to select your target role"}
                  </p>
                </div>

                {isAnalyzing ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <div className="mb-2 h-5 w-3/4 rounded bg-slate-200"></div>
                        <div className="mb-4 h-4 w-1/2 rounded bg-slate-200"></div>
                        <div className="h-16 w-full rounded bg-slate-200"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => {
                      const isSelected = selectedRole === suggestion.role;
                      // Truncate reasoning to 150 characters
                      const truncatedReasoning =
                        suggestion.reasoning.length > 150
                          ? suggestion.reasoning.substring(0, 150) + "..."
                          : suggestion.reasoning;

                      return (
                        <Card
                          key={index}
                          onClick={() => handleSelectRole(suggestion.role)}
                          className={`group relative cursor-pointer border-2 bg-white transition-all ${
                            isSelected
                              ? "border-[#1E5F74] shadow-md ring-2 ring-[#1E5F74]/20"
                              : "border-slate-200 hover:border-[#1E5F74] hover:shadow-md"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#1E5F74] text-white shadow-lg">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold text-slate-900">
                              {suggestion.role}
                            </CardTitle>
                            <CardDescription
                              className={`text-sm font-semibold ${
                                isSelected ? "text-[#1E5F74]" : "text-[#133B5C]"
                              }`}
                            >
                              {suggestion.matchPercentage}% Match
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-0">
                            <p className="text-sm leading-relaxed text-slate-600">
                              {truncatedReasoning}
                            </p>
                            {!isSelected && (
                              <Button
                                type="button"
                                size="sm"
                                className="w-full gap-2 bg-[#1D2D50] text-white transition-colors hover:bg-[#152340]"
                              >
                                Select this path
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                            {isSelected && (
                              <div className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1E5F74] py-2 text-sm font-semibold text-white">
                                <CheckCircle className="h-4 w-4" />
                                Selected
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
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
            <InfoBox icon={Info} title="How This Works">
              <p>
                {data.resumeText
                  ? "We'll use your CV context to create a personalized roadmap in the next step."
                  : "Our AI will analyze your interests to suggest career paths that align with your preferences."}
              </p>
            </InfoBox>
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
