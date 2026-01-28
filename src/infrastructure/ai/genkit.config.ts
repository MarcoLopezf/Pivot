import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

/**
 * Genkit Configuration
 *
 * Initializes Google Genkit with the Google AI plugin (Gemini models).
 * This is called once at application startup.
 */

// Validate that API key is present
if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error(
    "GOOGLE_AI_API_KEY environment variable is required for Genkit AI features",
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    }),
  ],
});
