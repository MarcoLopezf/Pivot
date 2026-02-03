import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import { tavily } from "@tavily/core";
import {
  MarketResearchSchema,
  type MarketResearch,
} from "../schemas/marketSchema";

/**
 * analyzeMarketFlow
 *
 * Direct Retrieval (RAG) pattern for market analysis.
 * Calls Tavily search first, then uses AI to synthesize the data.
 * Implements a Cascade strategy for regional fallbacks.
 */
export async function analyzeMarketFlow(input: {
  role: string;
  region: string;
}): Promise<MarketResearch> {
  const { role, region } = input;

  // 1. Initialize Tavily
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

  // 2. Smart Cascade Query
  const query = `
    Market research: Salary range (hourly/monthly), demand trends, and critical skills for '${role}' in:
    1. ${region} (Primary focus)
    2. LATAM / South America (Secondary focus)
    3. Global / US remote rates (Fallback)
    Data for years 2024 and 2025.
  `;

  // 3. Execute Search (Direct Call)
  let searchContext = "";
  try {
    const searchResult = await tvly.search(query, {
      searchDepth: "advanced",
      maxResults: 7,
      includeAnswer: true,
    });
    searchContext = JSON.stringify(searchResult);
  } catch (error) {
    console.error("Tavily search failed:", error);
    searchContext =
      "Search unavailable. Proceed with general market knowledge.";
  }

  // 4. AI Analysis with Priority Protocol
  const { text } = await ai.generate({
    model: openAI.model("gpt-4o-mini"),
    prompt: `
      You are an expert Tech Recruitment Analyst.
      
      **CONTEXT FROM MARKET SEARCH:**
      ${searchContext}

      **TASK:**
      Analyze the market for the role '${role}' targeting the region: '${region}'.
      
      **DATA PRIORITY PROTOCOL (CASCADE):**
      1. **Tier 1 (Target):** Look for specific numbers for '${region}'. If found, use them accurately.
      2. **Tier 2 (Regional Fallback):** If exact data for '${region}' is missing, use data for 'LATAM' or neighboring countries.
      3. **Tier 3 (Global Fallback):** If neither are found, use Global/US remote rates but apply a logical adjustment (e.g., -40% for cost of living) to make it realistic for '${region}'.
      
      **OUTPUT REQUIREMENTS:**
      - **Salary:** Must be in the currency most common for tech contracts in that region (usually USD for Remote/LATAM).
      - **Demand:** Infer the trend based on the "recency" and volume of job mentions in the context.
      - **Skills:** Focus on technical hard skills mentioned.
      
      Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
      {
        "salary": {
          "currency": "USD",
          "hourly": { "min": number, "median": number, "max": number },
          "annual": { "min": number, "median": number, "max": number }
        },
        "demand": {
          "score": number (0-100),
          "verdict": "Low" | "Moderate" | "High" | "Very High",
          "trend": "Declining" | "Stable" | "Growing" | "Exploding"
        },
        "top_skills": [
          { "name": string, "category": "Language" | "Framework" | "Database" | "Cloud" | "Tooling" | "Concept", "relevance": number (0-100) }
        ],
        "analysis": {
          "summary": string,
          "key_growth_factor": string,
          "barrier_to_entry": "Low" | "Medium" | "High"
        }
      }
    `,
    config: {
      temperature: 0.7,
    },
  });

  // 5. Parse and validate
  const cleaned = stripMarkdownCodeBlock(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Failed to generate market analysis for role: ${role}. Invalid JSON.`,
    );
  }

  const result = MarketResearchSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Failed to generate market analysis for role: ${role}. Schema validation failed.`,
    );
  }

  return result.data;
}

/**
 * Strips markdown code block formatting from AI response
 */
function stripMarkdownCodeBlock(raw: string): string {
  const trimmed = raw.trim();
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/;
  const match = codeBlockRegex.exec(trimmed);
  if (match) {
    return match[1].trim();
  }
  return trimmed;
}
