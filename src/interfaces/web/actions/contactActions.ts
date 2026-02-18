"use server";

import { z } from "zod";
import { InquiryType } from "@domain/contact/InquiryType";
import { contactContainer } from "@infrastructure/di/ContactContainer";

const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be between 2 and 100 characters")
    .max(100, "Name must be between 2 and 100 characters")
    .transform((v) => v.trim()),
  email: z
    .string()
    .email("Please enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
  inquiryType: z.nativeEnum(InquiryType, {
    error: "Please select a valid inquiry type",
  }),
  message: z
    .string()
    .min(10, "Message must be between 10 and 5000 characters")
    .max(5000, "Message must be between 10 and 5000 characters")
    .transform((v) => v.trim()),
});

/**
 * Server Action: Submit Contact Message
 *
 * Validates and stores a contact form submission.
 * No authentication required (public form).
 *
 * @layer Interface (Web)
 */
export async function submitContactAction(
  fullName: string,
  email: string,
  inquiryType: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const result = contactFormSchema.safeParse({
    fullName,
    email,
    inquiryType,
    message,
  });

  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, error: firstError?.message ?? "Invalid input" };
  }

  try {
    const useCase = contactContainer.getSubmitContactMessageUseCase();
    await useCase.execute(result.data);
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}
