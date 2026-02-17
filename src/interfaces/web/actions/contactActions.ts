"use server";

import { prisma } from "@infrastructure/database/PrismaClient";
import { InquiryType } from "@prisma/client";

const VALID_INQUIRY_TYPES: InquiryType[] = [
  "FEEDBACK",
  "BUG_REPORT",
  "FEATURE_REQUEST",
  "SUGGESTION",
  "GENERAL_INQUIRY",
];

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
  try {
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return {
        success: false,
        error: "Name must be between 2 and 100 characters",
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (!VALID_INQUIRY_TYPES.includes(inquiryType as InquiryType)) {
      return { success: false, error: "Please select a valid inquiry type" };
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 5000) {
      return {
        success: false,
        error: "Message must be between 10 and 5000 characters",
      };
    }

    await prisma.contactMessage.create({
      data: {
        fullName: trimmedName,
        email: trimmedEmail,
        inquiryType: inquiryType as InquiryType,
        message: trimmedMessage,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit contact message:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}
