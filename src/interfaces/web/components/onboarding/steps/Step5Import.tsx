"use client";

import { useState, useRef } from "react";
import { StepContainer } from "../StepContainer";
import { useOnboardingStore } from "@interfaces/web/stores/useOnboardingStore";
import { uploadResumeAction } from "@interfaces/web/actions/documentActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

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
 * @layer Interface (Web)
 */
export function Step5Import() {
  const { data, nextStep, previousStep, updateData, saveCurrentStep } =
    useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read uploaded file from store instead of local state
  const uploadedFile = data.resumeFileName as string | undefined;

  console.log(
    "Step5Import rendering - uploadedFile:",
    uploadedFile,
    "isUploading:",
    isUploading,
    "error:",
    error,
  );

  /**
   * Handles file upload and parsing
   */
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log("1. Starting file upload...");
      // Create FormData and append file
      const formData = new FormData();
      formData.append("file", file);

      // Call server action
      console.log("2. Calling uploadResumeAction...");
      const result = await uploadResumeAction(formData);
      console.log("3. Upload result:", result);

      if (!result.success) {
        throw new Error(result.error || "Failed to upload file");
      }

      // Update store with both extracted text and filename
      console.log("4. Updating store with extracted text...");
      updateData({
        resumeText: result.extractedText,
        resumeFileName: result.fileName,
      });

      // Save to server with all current data
      console.log("5. Saving current step to server...");
      await saveCurrentStep();
      console.log("6. Save completed successfully");
      console.log("7. Upload complete!");
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
      console.log("handleNext: Saving step before advancing...");
      await saveCurrentStep();
      console.log("handleNext: Save complete, advancing to next step");
      nextStep();
    } catch (err) {
      console.error("Error proceeding to next step:", err);
      setError("Failed to save progress");
    }
  };

  return (
    <StepContainer
      title="Import Your Experience"
      description="Upload your CV or LinkedIn PDF export to personalize your learning path (optional)"
      onNext={uploadedFile ? handleNext : handleSkip}
      onBack={previousStep}
      isLoading={isUploading}
      nextLabel={uploadedFile ? "Continue" : "Skip for Now"}
    >
      <div className="space-y-6">
        {/* Upload Area */}
        {!uploadedFile && (
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              {isUploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              ) : (
                <Upload className="h-8 w-8 text-blue-600" />
              )}
            </div>

            {/* Text */}
            <div className="mb-4">
              <p className="mb-2 text-lg font-medium text-gray-900">
                {isUploading ? "Parsing your CV..." : "Drop your PDF here"}
              </p>
              <p className="text-sm text-gray-600">or click to browse</p>
            </div>

            {/* Browse Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="gap-2"
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
            <p className="mt-4 text-xs text-gray-500">
              PDF only • Max 5MB • Your data is private and secure
            </p>
          </div>
        )}

        {/* Success State */}
        {uploadedFile && !error && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">
                  CV Uploaded Successfully
                </h3>
                <p className="mt-1 text-sm text-green-700">{uploadedFile}</p>
                <p className="mt-2 text-sm text-green-600">
                  Your experience will be used to personalize your learning
                  roadmap
                </p>
              </div>
            </div>

            {/* Option to re-upload */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateData({
                  resumeFileName: undefined,
                  resumeText: undefined,
                });
                setError(null);
              }}
              className="mt-4 gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Different File
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Upload Failed</h4>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-900">Why upload your CV?</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-700">
            <li>• Get a personalized roadmap based on your experience</li>
            <li>• AI analyzes your skills to identify knowledge gaps</li>
            <li>• Skip topics you already know</li>
          </ul>
        </div>

        {/* Skip Option */}
        {!uploadedFile && (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isUploading}
              className="text-gray-600 hover:text-gray-900"
            >
              I&apos;ll enter details manually
            </Button>
          </div>
        )}
      </div>
    </StepContainer>
  );
}
