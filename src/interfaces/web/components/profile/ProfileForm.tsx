"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Zod schema matching CreateUserDTO
 */
const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * API Response Types
 */
interface ApiSuccessResponse {
  success: true;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/**
 * ProfileForm Component
 *
 * Client component for creating a new user profile.
 * Uses React Hook Form with Zod validation and integrates with the POST /api/profile endpoint.
 */
export function ProfileForm(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: ProfileFormValues): Promise<void> => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        // Handle error responses
        if (!data.success) {
          // Handle specific error codes
          if (data.error.code === "USER_ALREADY_EXISTS") {
            // Set field-level error for email
            form.setError("email", {
              type: "manual",
              message: "A user with this email already exists",
            });
            toast.error("Email already exists", {
              description: "Please use a different email address",
            });
            return;
          }

          if (data.error.code === "INVALID_EMAIL") {
            form.setError("email", {
              type: "manual",
              message: data.error.message,
            });
            toast.error("Invalid email", {
              description: data.error.message,
            });
            return;
          }

          // Generic error handling
          toast.error("Failed to create profile", {
            description: data.error.message,
          });
          return;
        }
      }

      // Success case
      if (data.success) {
        toast.success("Profile created successfully!", {
          description: `Welcome, ${data.data.name}!`,
        });

        // Redirect to dashboard or next step
        // Using a slight delay to ensure toast is visible
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      // Handle network errors or unexpected errors
      console.error("Error submitting form:", error);
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating profile..." : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
}
