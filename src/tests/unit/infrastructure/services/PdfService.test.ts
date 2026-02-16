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

    it("should successfully extract text from valid PDF buffer", async () => {
      // Valid PDF buffer (mocked to return text)
      const buffer = Buffer.from("mock-pdf-content");

      const result = await service.extractText(buffer);

      expect(result).toBe("Mocked PDF text content");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
