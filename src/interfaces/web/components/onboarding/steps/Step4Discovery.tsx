"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StepContainer } from "@/interfaces/web/components/onboarding/StepContainer";
import { useOnboardingStore } from "@/interfaces/web/stores/useOnboardingStore";
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
});

type DiscoveryGoalsFormValues = z.infer<typeof discoveryGoalsSchema>;

export function Step4Discovery() {
  const {
    data,
    updateData,
    saveCurrentStep,
    nextStep,
    previousStep,
    isLoading,
  } = useOnboardingStore();

  // Initialize form with store values
  const form = useForm<DiscoveryGoalsFormValues>({
    resolver: zodResolver(discoveryGoalsSchema),
    defaultValues: {
      interests: (data.interests as string) || "",
      dislike: (data.dislike as string) || "",
    },
  });

  /**
   * Handles form submission
   * Updates store data, saves progress, and navigates to next step (Import)
   */
  const onSubmit = async (values: DiscoveryGoalsFormValues): Promise<void> => {
    try {
      // Update store with form data
      updateData(values);

      // Save progress to server
      await saveCurrentStep();

      // Navigate to next step (Import CV)
      // TODO: In the future, trigger AI suggestion flow here
      nextStep();
    } catch (error) {
      console.error("Error saving discovery goals:", error);
      // TODO: Show error toast to user
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
          isLoading={isLoading}
          nextLabel="Discover My Path"
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
                      disabled={isLoading}
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

            {/* Dislikes Field (Optional) */}
            <FormField
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Any topics, technologies, or work styles you&apos;d prefer
                    to stay away from?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
              <p className="font-medium">How This Works</p>
              <p className="mt-1">
                Our AI will analyze your profile, experience, and interests to
                suggest career paths that align with your strengths and
                preferences.
              </p>
            </div>
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
