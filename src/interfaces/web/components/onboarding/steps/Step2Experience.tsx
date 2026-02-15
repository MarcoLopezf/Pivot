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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { OnboardingInput } from "@/interfaces/web/components/onboarding/OnboardingFormComponents";
import { Clipboard } from "lucide-react";

/**
 * Step2Experience - Onboarding Step 2: Experience Level
 *
 * Collects information about the user's current professional status:
 * - Current job title/role
 * - Years of experience
 * - Student status (sets years to 0)
 *
 * This helps us understand the user's starting point for personalized
 * learning paths and career recommendations.
 *
 * @layer Interface (Web)
 */

// Validation schema
const experienceSchema = z.object({
  currentRole: z
    .string()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be less than 100 characters"),
  yearsExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(70, "Please enter a valid number of years"),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export function Step2Experience() {
  const {
    data,
    updateData,
    saveCurrentStep,
    setStep,
    previousStep,
    isLoading,
  } = useOnboardingStore();

  const [isStudent, setIsStudent] = useState(false);
  const [studentStatus, setStudentStatus] = useState("no");

  // Initialize form with store values
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      currentRole: (data.currentRole as string) || "",
      yearsExperience: (data.yearsExperience as number) || 0,
    },
  });

  /**
   * Handles form submission
   * Updates store data, saves progress, and navigates to next step
   */
  const onSubmit = async (values: ExperienceFormValues): Promise<void> => {
    try {
      // Update store with form data
      updateData(values);

      // Save progress to server
      await saveCurrentStep();

      // Navigate to next step
      setStep("PATH_SELECTION");
    } catch (error) {
      console.error("Error saving experience:", error);
      // TODO: Show error toast to user
    }
  };

  /**
   * Handles student status change
   * When user selects "I am a student", sets years of experience to 0
   */
  const handleStudentChange = (value: string): void => {
    setStudentStatus(value);
    const isStudentValue = value === "yes";
    setIsStudent(isStudentValue);

    if (isStudentValue) {
      form.setValue("yearsExperience", 0);
      form.setValue("currentRole", "Student");
    } else {
      // Reset to previous values or defaults
      form.setValue("currentRole", (data.currentRole as string) || "");
      form.setValue("yearsExperience", (data.yearsExperience as number) || 0);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepContainer
          currentStep={2}
          title="Tell us about your experience"
          description="Help us understand where you are in your career journey."
          quote="Every expert was once a beginner. Your journey is unique."
          quoteAuthor="ANONYMOUS"
          leftPanelFooter="© 2025 Pivot AI Inc."
          onNext={form.handleSubmit(onSubmit)}
          onBack={previousStep}
          isNextDisabled={!form.formState.isValid && !isStudent}
          isLoading={isLoading}
          nextLabel="Continue"
        >
          <div className="space-y-6">
            {/* Student Status Radio Group */}
            <div className="space-y-3">
              <Label className="text-slate-900 font-normal text-sm">
                Are you currently a student?
              </Label>
              <RadioGroup
                defaultValue="no"
                value={studentStatus}
                onValueChange={handleStudentChange}
                disabled={isLoading}
                className="space-y-3"
              >
                <div
                  className={`flex items-center space-x-3 rounded-lg bg-white p-3.5 transition-all cursor-pointer ${
                    studentStatus === "yes"
                      ? "border-2 border-[#1D2D50]"
                      : "border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem
                    value="yes"
                    id="student-yes"
                    className="border-slate-400"
                  />
                  <Label
                    htmlFor="student-yes"
                    className="font-normal text-slate-900 cursor-pointer flex-1 text-sm"
                  >
                    Yes, I&apos;m a student
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 rounded-lg bg-white p-3.5 transition-all cursor-pointer ${
                    studentStatus === "no"
                      ? "border-2 border-[#1E5F74]"
                      : "border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem
                    value="no"
                    id="student-no"
                    className="border-slate-400"
                  />
                  <Label
                    htmlFor="student-no"
                    className="font-normal text-slate-900 cursor-pointer flex-1 text-sm"
                  >
                    No, I&apos;m working or seeking employment
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Current Role Field */}
            <FormField
              control={form.control}
              name="currentRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 font-normal text-sm">
                    Current Job Title / Role
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <OnboardingInput
                        placeholder="e.g., React native developer"
                        {...field}
                        disabled={isLoading || isStudent}
                        className="pr-10"
                      />
                      <Clipboard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </FormControl>
                  <FormDescription className="text-slate-500 text-xs">
                    What&apos;s your current role? (Any background is welcome!)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Years of Experience Field */}
            <FormField
              control={form.control}
              name="yearsExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 font-normal text-sm">
                    Years of Professional Experience
                  </FormLabel>
                  <FormControl>
                    <OnboardingInput
                      type="number"
                      min="0"
                      max="70"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      disabled={isLoading || isStudent}
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500 text-xs">
                    Total years of professional work experience (0 if
                    you&apos;re a student or just starting).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Info Message */}
            {isStudent && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-medium">Student Mode</p>
                <p className="mt-1">
                  We&apos;ll focus on entry-level opportunities and learning
                  paths perfect for starting your career.
                </p>
              </div>
            )}
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
