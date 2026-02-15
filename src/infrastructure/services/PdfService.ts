import { extractText as unpdfExtractText } from "unpdf";

/**
 * PdfService - Infrastructure service for PDF text extraction
 *
 * Provides functionality to extract text content from PDF files.
 * Used to process uploaded CVs for personalized roadmap generation.
 *
 * Infrastructure Layer - Implements external dependency (unpdf)
 * Uses unpdf for serverless-compatible PDF parsing (Vercel, AWS Lambda, etc.)
 */
export class PdfService {
  /**
   * Extracts text content from a PDF buffer
   *
   * @param buffer - PDF file as a Buffer
   * @returns Extracted text content from the PDF
   * @throws Error if buffer is empty or PDF parsing fails
   */
  async extractText(buffer: Buffer): Promise<string> {
    // Validate buffer
    if (!buffer || buffer.length === 0) {
      throw new Error("PDF buffer cannot be empty");
    }

    try {
      // Use unpdf for serverless-compatible PDF parsing
      const result = await unpdfExtractText(buffer, { mergePages: true });

      // unpdf returns { text: string } or just the text string
      const text = typeof result === "string" ? result : result.text;

      return text;
    } catch (error) {
      // Wrap unpdf errors with context
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  }
}
