import { z } from "zod";
import { ai } from "../genkit.config";
import { tavily } from "@tavily/core";
import { MarketResearchSchema } from "../schemas/marketSchema";
import type { MarketResearch } from "../schemas/marketSchema";

// Define input schema
const InputSchema = z.object({
  role: z.string(),
  region: z.string(),
});

type FlowInput = z.infer<typeof InputSchema>;

// Internal flow definition
const internalFlow = ai.defineFlow(
  {
    name: "analyzeMarketFlow",
    inputSchema: InputSchema as never,
    outputSchema: MarketResearchSchema as never,
  },
  async (input) => {
    const { role, region } = input as FlowInput;
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) throw new Error("TAVILY_API_KEY is missing");

    const tvly = tavily({ apiKey });

    // 1. Strategic Query: We explicitly ask for the progression (Junior vs Senior)
    const query = `
      Tech Salary Report 2024-2025: Pay scale progression for '${role}' in '${region}'.
      Find hourly rates (USD) for:
      1. Junior / Entry-level (0-2 years)
      2. Mid-level / SSr (2-5 years)
      3. Senior (5+ years)
      Also include market demand and top required skills.
      Context: ${region} market, LATAM remote rates if applicable.
    `;

    // 2. Execute Search
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
        "Search unavailable. Estimate based on global standards for " + region;
    }

    // 3. AI Extraction - Using text output and JSON parsing
    const { text } = await ai.generate({
      model: "openai/gpt-4o-mini",
      prompt: `You are a Specialized Tech Recruiter.
        
**CONTEXT:**
${searchContext}

**MISSION:**
Extract the **Career Salary Ladder** for '${role}' in '${region}'.

**OUTPUT FORMAT (JSON):**
{
  "role": "${role}",
  "region": "${region}",
  "salary_ladder": {
    "junior": { "min": <number>, "max": <number>, "median": <number>, "currency": "USD" },
    "mid": { "min": <number>, "max": <number>, "median": <number>, "currency": "USD" },
    "senior": { "min": <number>, "max": <number>, "median": <number>, "currency": "USD" }
  },
  "demand": {
    "verdict": "<High|Medium|Low>",
    "score": <0-100>,
    "trend": "<Growing|Stable|Declining>"
  },
  "top_skills": [
    { "name": "<skill>", "relevance": <0-100> }
  ],
  "analysis": {
    "summary": "<2-3 sentence market summary>",
    "key_growth_factor": "<main driver of growth>"
  }
}

**REQUIREMENTS:**
1. All salary values are HOURLY RATES in USD (integers).
2. If explicit data is missing, infer logically (Junior is typically 40-50% of Senior).
3. Return ONLY valid JSON, no additional text.

JSON:`,
    });

    // Parse and validate with Zod
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = MarketResearchSchema.parse(parsed);

    return validated;
  },
);

/**
 * analyzeMarketFlow
 *
 * Public wrapper with proper typing for external callers.
 * Fetches Career Ladder salary data (Junior/Mid/Senior) via RAG pattern.
 */
export async function analyzeMarketFlow(
  input: FlowInput,
): Promise<MarketResearch> {
  const flowFn = internalFlow as unknown as (
    input: FlowInput,
  ) => Promise<MarketResearch>;
  const result = await flowFn(input);
  return result;
}
