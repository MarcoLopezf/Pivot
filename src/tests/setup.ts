/**
 * Vitest Setup File
 *
 * Runs before all tests to configure the test environment.
 */

import { config } from "dotenv";
import { vi } from "vitest";

// CRITICAL: Set DATABASE_URL to test database BEFORE loading .env
// This must happen before any Prisma Client is initialized
process.env.DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/pivot_test?schema=public";

// Load environment variables from .env file (will not override DATABASE_URL)
config();

// Verify test database is being used
if (!process.env.DATABASE_URL.includes("pivot_test")) {
  throw new Error(
    "Tests must use test database! DATABASE_URL does not point to pivot_test",
  );
}

// Mock pdf-parse globally to avoid DOMMatrix errors in test environment
vi.mock("pdf-parse", () => ({
  default: vi.fn().mockResolvedValue({
    text: "Mocked PDF text content",
    numpages: 1,
    info: {},
    metadata: null,
    version: "1.10.100",
  }),
}));
