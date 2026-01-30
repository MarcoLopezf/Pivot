/**
 * PdfService - Infrastructure service for PDF text extraction
 *
 * Provides functionality to extract text content from PDF files.
 * Used to process uploaded CVs for personalized roadmap generation.
 *
 * Infrastructure Layer - Implements external dependency (pdf-parse)
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
      // Lazy load pdf-parse to allow mocking in tests
      /* eslint-disable @typescript-eslint/no-require-imports */
      const { PDFParse } = require("pdf-parse");
      /* eslint-enable @typescript-eslint/no-require-imports */

      // Parse PDF using v2 API (class-based)
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    } catch (error) {
      // Wrap pdf-parse errors with context
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  }
}
