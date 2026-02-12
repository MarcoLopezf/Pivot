import { describe, it, expect } from "vitest";
import { PdfService } from "@infrastructure/services/PdfService";

describe("PdfService", () => {
  const service = new PdfService();

  describe("extractText", () => {
    it("should throw when buffer is empty", async () => {
      const emptyBuffer = Buffer.from("");

      await expect(service.extractText(emptyBuffer)).rejects.toThrow(
        "PDF buffer cannot be empty",
      );
    });

    it("should throw when buffer is null-like", async () => {
      await expect(
        service.extractText(null as unknown as Buffer),
      ).rejects.toThrow("PDF buffer cannot be empty");
    });

    it("should wrap parsing errors with context message", async () => {
      // The jsdom environment doesn't have DOMMatrix, so pdf-parse fails.
      // This exercises the catch block (lines 33-38) with an Error instance.
      const buffer = Buffer.from("not-a-real-pdf");

      await expect(service.extractText(buffer)).rejects.toThrow(
        "Failed to extract text from PDF:",
      );
    });
  });
});
