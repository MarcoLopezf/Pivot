"use client";

import { useState, useRef } from "react";
import { z } from "zod";
import { StepContainer } from "../StepContainer";
import { InfoBox } from "../InfoBox";
import { OnboardingTextarea } from "../OnboardingFormComponents";
import { useOnboardingStore } from "@interfaces/web/stores/useOnboardingStore";
import { uploadResumeAction } from "@interfaces/web/actions/documentActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CloudUpload,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  Info,
} from "lucide-react";

type InputMode = "upload" | "manual";

const manualExperienceSchema = z.object({
  experienceText: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters describing your experience")
    .max(1000, "Must be less than 1,000 characters")
    .transform((val) => val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")),
});

/**
 * Step5Import - CV/Resume Upload or Manual Experience Entry Step
 *
 * Allows users to either upload their CV/LinkedIn PDF export or manually
 * describe their experience to personalize their learning roadmap.
 *
 * Features:
 * - Drag-and-drop file upload (PDF)
 * - Manual text entry with validation (1000 char limit)
 * - Mutually exclusive modes (upload OR manual)
 * - Loading state during parsing
 * - Success/error feedback
 * - Skip option
 *
 * @layer Interface (Web)
 */
export function Step5Import() {
  const { data, nextStep, previousStep, updateData, saveCurrentStep } =
    useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode: upload (default) or manual text entry
  const [mode, setMode] = useState<InputMode>(() => {
    if (data.resumeText && !data.resumeFileName) return "manual";
    return "upload";
  });
  const [manualText, setManualText] = useState<string>(() => {
    if (data.resumeText && !data.resumeFileName) {
      return typeof data.resumeText === "string" ? data.resumeText : "";
    }
    return "";
  });

  // Check if file was uploaded
  const uploadedFile = data.resumeFileName as string | undefined;

  // Manual text validation
  const trimmedText = manualText.trim();
  const characterCount = trimmedText.length;
  const isManualTextValid = characterCount >= 10 && characterCount <= 1000;

  /**
   * Handles file upload and parsing
   */
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Create FormData and append file
      const formData = new FormData();
      formData.append("file", file);

      // Call server action
      const result = await uploadResumeAction(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to upload file");
      }

      // Update store with both extracted text and filename
      // (will be saved to server when user clicks "Generate Roadmap")
      updateData({
        resumeText: result.extractedText,
        resumeFileName: result.fileName,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file");
        return;
      }
      handleFileUpload(file);
    }
  };

  /**
   * Trigger file input click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle "Skip" - proceed without uploading
   */
  const handleSkip = async () => {
    try {
      // Save current step before proceeding
      await saveCurrentStep();
      nextStep();
    } catch (err) {
      console.error("Error skipping step:", err);
      setError("Failed to save progress");
    }
  };

  /**
   * Handle "Next" - proceed with uploaded file
   */
  const handleNext = async () => {
    try {
      await saveCurrentStep();
      nextStep();
    } catch (err) {
      console.error("Error proceeding to next step:", err);
      setError("Failed to save progress");
    }
  };

  /**
   * Handle manual experience submission
   */
  const handleManualSubmit = async () => {
    try {
      const parsed = manualExperienceSchema.parse({
        experienceText: manualText,
      });
      updateData({
        resumeText: parsed.experienceText,
        resumeFileName: undefined,
      });
      await saveCurrentStep();
      nextStep();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? "Invalid input");
      } else {
        console.error("Error saving manual experience:", err);
        setError("Failed to save progress");
      }
    }
  };

  /**
   * Switch to manual text entry mode
   */
  const handleSwitchToManual = () => {
    updateData({ resumeText: undefined, resumeFileName: undefined });
    setError(null);
    setMode("manual");
  };

  /**
   * Switch back to PDF upload mode
   */
  const handleSwitchToUpload = () => {
    updateData({ resumeText: undefined, resumeFileName: undefined });
    setManualText("");
    setError(null);
    setMode("upload");
  };

  return (
    <StepContainer
      currentStep={5}
      totalSteps={7}
      title="Import Your Experience"
      description="Upload your CV or describe your experience to personalize your learning path (optional)."
      quote="Success is where preparation and opportunity meet."
      quoteAuthor="Bobby Unser"
      onNext={
        uploadedFile
          ? handleNext
          : mode === "manual"
            ? handleManualSubmit
            : handleSkip
      }
      onBack={previousStep}
      isLoading={isUploading}
      isNextDisabled={mode === "manual" && !uploadedFile && !isManualTextValid}
      nextLabel={
        uploadedFile
          ? "Continue"
          : mode === "manual"
            ? "Continue"
            : "Skip for Now"
      }
    >
      <div className="space-y-6">
        {/* Upload Area - Only show in upload mode when no file uploaded */}
        {mode === "upload" && !uploadedFile && (
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-[#1E5F74] bg-slate-50"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              {isUploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E5F74] border-t-transparent"></div>
              ) : (
                <CloudUpload className="h-10 w-10 text-slate-400" />
              )}
            </div>

            {/* Text */}
            <div className="mb-6">
              <p className="mb-2 text-base font-medium text-slate-900">
                {isUploading ? "Parsing your CV..." : "Drop your PDF here"}
              </p>
              <p className="text-sm text-slate-600">
                or click to browse from your computer
              </p>
            </div>

            {/* Browse Button */}
            <Button
              type="button"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="gap-2 bg-[#1D2D50] hover:bg-[#152340] text-white"
            >
              <FileText className="h-4 w-4" />
              Browse Files
            </Button>

            {/* Hidden File Input */}
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />

            {/* File Requirements */}
            <p className="mt-4 text-xs text-slate-500">
              PDF only • Max 5MB • Your data is private and secure
            </p>
          </div>
        )}

        {/* Success State - File Uploaded */}
        {uploadedFile && !error && (
          <>
            {/* File Info Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                {/* File Icon + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-red-50">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {uploadedFile}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateData({
                      resumeFileName: undefined,
                      resumeText: undefined,
                    });
                    setError(null);
                  }}
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-slate-100"
                >
                  <Trash2 className="h-4 w-4 text-slate-600" />
                </Button>
              </div>
            </div>

            {/* Confirmation Card */}
            <InfoBox variant="success" icon={CheckCircle}>
              <p className="font-medium">
                CV successfully uploaded and analyzed by AI!
              </p>
            </InfoBox>
          </>
        )}

        {/* Manual Input Area - Only show in manual mode when no file uploaded */}
        {mode === "manual" && !uploadedFile && (
          <div className="space-y-3">
            <OnboardingTextarea
              placeholder={
                "Describe your professional experience, skills, and background. For example:\n\nI have 3 years of experience as a frontend developer working with React and TypeScript. I've built e-commerce applications and worked with REST APIs..."
              }
              rows={6}
              maxLength={1000}
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                setError(null);
              }}
              className="resize-none"
            />
            <div className="flex justify-end">
              <span
                className={`text-xs ${
                  characterCount > 900
                    ? "text-amber-600"
                    : characterCount > 0
                      ? "text-slate-500"
                      : "text-slate-400"
                }`}
              >
                {characterCount.toLocaleString()}/1,000
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <InfoBox
            icon={AlertCircle}
            title={mode === "manual" ? "Validation Error" : "Upload Failed"}
          >
            <p>{error}</p>
          </InfoBox>
        )}

        {/* Info Box - Always visible */}
        <InfoBox
          icon={Info}
          title={
            mode === "manual"
              ? "Why share your experience?"
              : "Why upload your CV?"
          }
        >
          <ul className="space-y-1.5">
            <li>• Get a personalized roadmap based on your experience</li>
            <li>• AI analyzes your skills to identify knowledge gaps</li>
            <li>• Skip topics you already know</li>
          </ul>
        </InfoBox>

        {/* Mode Toggle - Show when no file is uploaded */}
        {!uploadedFile && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={
                mode === "upload" ? handleSwitchToManual : handleSwitchToUpload
              }
              disabled={isUploading}
              className="text-slate-500 hover:text-slate-900 hover:bg-transparent text-sm"
            >
              {mode === "upload"
                ? "I\u2019ll enter details manually instead"
                : "Upload a PDF instead"}
            </Button>
          </div>
        )}
      </div>
    </StepContainer>
  );
}
