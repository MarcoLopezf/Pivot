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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * Step1Profile - Onboarding Step 1: Profile Information
 *
 * Collects basic identity information from the user:
 * - Full name
 * - Region/Location (crucial for future market data)
 * - Short bio (optional)
 *
 * @layer Interface (Web)
 */

// Validation schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  region: z.string().min(1, "Region is required"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function Step1Profile() {
  const { data, updateData, saveCurrentStep, setStep, isLoading } =
    useOnboardingStore();

  // Initialize form with store values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: (data.name as string) || "",
      region: (data.region as string) || "",
      bio: (data.bio as string) || "",
    },
  });

  /**
   * Handles form submission
   * Updates store data, saves progress, and navigates to next step
   */
  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    try {
      // Update store with form data
      updateData(values);

      // Save progress to server
      await saveCurrentStep();

      // Navigate to next step
      setStep("EXPERIENCE");
    } catch (error) {
      console.error("Error saving profile:", error);
      // TODO: Show error toast to user
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <StepContainer
          title="Let's start with your profile"
          description="Tell us a bit about yourself so we can personalize your experience."
          onNext={form.handleSubmit(onSubmit)}
          isNextDisabled={!form.formState.isValid}
          isLoading={isLoading}
          nextLabel="Continue"
        >
          <div className="space-y-6">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    This is how we&apos;ll address you in the platform.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Region/Location Field */}
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region / Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="north-america">
                        North America
                      </SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="latam">LATAM</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="argentina">Argentina</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Helps us provide relevant job market insights for your area.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field (Optional) */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your background, interests, or goals..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief introduction about yourself (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </StepContainer>
      </form>
    </Form>
  );
}
