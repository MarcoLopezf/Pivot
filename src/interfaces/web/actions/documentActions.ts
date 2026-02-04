"use server";

import { createClient } from "@infrastructure/auth/supabase/server";
import { PdfService } from "@infrastructure/services/PdfService";
import { saveStepAction } from "@interfaces/web/actions/onboarding";

/**
 * Server Action: Upload Resume
 *
 * Handles PDF resume/CV upload during onboarding.
 * Extracts text content from the PDF and saves it to onboarding state.
 *
 * Security:
 * - Verifies user authentication via Supabase
 * - Validates file type (PDF only)
 * - Limits file size (5MB max)
 * - Only allows users to upload their own documents
 *
 * @param formData - FormData containing the PDF file
 * @returns Success status with filename or error
 *
 * @layer Interface (Web)
 */
export async function uploadResumeAction(
  formData: FormData,
): Promise<{ success: boolean; fileName?: string; error?: string }> {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // 2. Extract file from formData
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new Error("No file provided");
    }

    // 3. Validate file type
    if (file.type !== "application/pdf") {
      throw new Error("Invalid file type. Only PDF files are accepted.");
    }

    // 4. Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 5MB limit");
    }

    // 5. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Extract text using PdfService
    const pdfService = new PdfService();
    const extractedText = await pdfService.extractText(buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error(
        "Could not extract text from PDF. Please try another file.",
      );
    }

    // 7. Save extracted text to onboarding state
    // We'll store it in the current step (5) with resumeText field
    const result = await saveStepAction(5, {
      resumeText: extractedText,
      resumeFileName: file.name,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to save resume data");
    }

    // 8. Return success
    return {
      success: true,
      fileName: file.name,
    };
  } catch (error) {
    console.error("Error in uploadResumeAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload resume",
    };
  }
}
