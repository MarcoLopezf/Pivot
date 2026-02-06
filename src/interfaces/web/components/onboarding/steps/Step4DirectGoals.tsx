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
import { RoleCombobox } from "@/components/onboarding/RoleCombobox";

/**
 * Step4DirectGoals - Onboarding Step 4: Direct Goals
 *
 * For users who chose the DIRECT path.
 * Collects specific career goals:
 * - Target role (e.g., "Full Stack Developer")
 * - Target seniority level (Junior, Mid, Senior)
 *
 * This data will be used to generate a personalized learning roadmap.
 *
 * @layer Interface (Web)
 */

// Validation schema
const directGoalsSchema = z.object({
  targetRole: z
    .string()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be less than 100 characters"),
});

type DirectGoalsFormValues = z.infer<typeof directGoalsSchema>;

export function Step4DirectGoals() {
  const {
    data,
    updateData,
    saveCurrentStep,
    nextStep,
    previousStep,
    isLoading,
  } = useOnboardingStore();

  // Initialize form with store values
  const form = useForm<DirectGoalsFormValues>({
    resolver: zodResolver(directGoalsSchema),
    mode: "onChange", // Enable real-time validation for isValid updates
    defaultValues: {
      targetRole: typeof data.targetRole === "string" ? data.targetRole : "",
    },
  });

  /**
   * Handles form submission
   * Updates store data, saves progress, and navigates to next step (Import)
   */
  const onSubmit = async (values: DirectGoalsFormValues): Promise<void> => {
    try {
      // Update store with form data
      updateData(values);

      // Save progress to server
      await saveCurrentStep();

      // Navigate to next step (Import CV)
      nextStep();
    } catch (error) {
      console.error("Error saving direct goals:", error);
      // TODO: Show error toast to user
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepContainer
          title="What's your target role?"
          description="Tell us your specific career goal so we can create a personalized learning roadmap."
          onNext={form.handleSubmit(onSubmit)}
          onBack={previousStep}
          isNextDisabled={!form.formState.isValid}
          isLoading={isLoading}
          nextLabel="Generate Roadmap"
        >
          <div className="space-y-6">
            {/* Target Role Field */}
            <FormField
              control={form.control}
              name="targetRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Role</FormLabel>
                  <FormControl>
                    <RoleCombobox
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a tech role..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Select the tech role you want to achieve (required for
                    roadmap generation).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">Next Step</p>
              <p className="mt-1">
                We&apos;ll use your goal to generate a personalized learning
                roadmap with curated resources, projects, and milestones.
              </p>
            </div>
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
