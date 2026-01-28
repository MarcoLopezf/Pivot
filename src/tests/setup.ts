/**
 * Vitest Setup File
 *
 * Runs before all tests to configure the test environment.
 */

import { config } from "dotenv";

// Load environment variables from .env file
// This ensures OPENAI_API_KEY and other env vars are available during tests
config();
