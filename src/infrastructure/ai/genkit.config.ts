import { genkit } from "genkit";
import { openAI } from "@genkit-ai/compat-oai/openai";
// import { googleAI } from "@genkit-ai/google-genai";

/**
 * Genkit Configuration
 *
 * Initializes Genkit with OpenAI plugin.
 * This is called once at application startup.
 */

// Validate that API key is present
if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY environment variable is required for Genkit AI features",
  );
}

// Google AI configuration (commented out, switch to this if using Gemini)
// if (!process.env.GOOGLE_AI_API_KEY) {
//   throw new Error(
//     "GOOGLE_AI_API_KEY environment variable is required for Genkit AI features",
//   );
// }

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    // Switch to Google AI by uncommenting below and commenting OpenAI above:
    // googleAI({
    //   apiKey: process.env.GOOGLE_AI_API_KEY,
    // }),
  ],
});
