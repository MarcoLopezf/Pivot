/**
 * Vitest Setup File
 *
 * Runs before all tests to configure the test environment.
 */

import { config } from "dotenv";
import { vi } from "vitest";

// Load environment variables from .env file
config();

// CRITICAL: Override DATABASE_URL to use test database
// This ensures ALL Prisma instances (tests + API routes) use the Docker test DB
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Mock pdf-parse globally to avoid DOMMatrix errors in test environment
vi.mock("pdf-parse", () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn().mockResolvedValue({
      text: "Mocked PDF text content",
      pages: [],
    }),
  })),
}));
