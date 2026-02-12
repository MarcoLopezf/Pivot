"use client";

import { useState, useRef } from "react";
import { StepContainer } from "../StepContainer";
import { InfoBox } from "../InfoBox";
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

/**
 * Step5Import - CV/Resume Upload Step
 *
 * Allows users to upload their CV or LinkedIn PDF export to personalize
 * their learning roadmap. The PDF is parsed and text is extracted for AI analysis.
 *
 * Features:
 * - Drag-and-drop file upload
 * - File validation (PDF only, 5MB max)
 * - Loading state during parsing
 * - Success/error feedback
 * - Skip option for manual entry
 *
 * TECHNICAL DEBT:
 * - TODO: Add manual input form for users who want to enter details manually
 *   instead of uploading CV (currently just a link button)
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

  // Check if file was uploaded
  const uploadedFile = data.resumeFileName as string | undefined;

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

  return (
    <StepContainer
      currentStep={5}
      totalSteps={7}
      title="Import Your Experience"
      description="Upload your CV or LinkedIn PDF export to personalize your learning path (optional)."
      quote="Success is where preparation and opportunity meet."
      quoteAuthor="Bobby Unser"
      onNext={uploadedFile ? handleNext : handleSkip}
      onBack={previousStep}
      isLoading={isUploading}
      nextLabel={uploadedFile ? "Continue" : "Skip for Now"}
    >
      <div className="space-y-6">
        {/* Upload Area - Only show if no file uploaded yet */}
        {!uploadedFile && (
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

        {/* Error State */}
        {error && (
          <InfoBox icon={AlertCircle} title="Upload Failed">
            <p>{error}</p>
          </InfoBox>
        )}

        {/* Info Box - Always visible */}
        <InfoBox icon={Info} title="Why upload your CV?">
          <ul className="space-y-1.5">
            <li>• Get a personalized roadmap based on your experience</li>
            <li>• AI analyzes your skills to identify knowledge gaps</li>
            <li>• Skip topics you already know</li>
          </ul>
        </InfoBox>

        {/* Manual Entry Link - Always visible */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isUploading}
            className="text-slate-500 hover:text-slate-900 hover:bg-transparent text-sm"
          >
            I&apos;ll enter details manually instead
          </Button>
        </div>
      </div>
    </StepContainer>
  );
}
