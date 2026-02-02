import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import { z } from "zod";

/**
 * Input schema for project analysis
 */
export const AnalyzeProjectInputSchema = z.object({
  repoUrl: z.string().url(),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    }),
  ),
  topic: z.string().min(1, "Topic is required"),
  description: z.string().min(1, "Description is required"),
  expectedSkills: z.string(),
});

export type AnalyzeProjectInput = z.infer<typeof AnalyzeProjectInputSchema>;

/**
 * Output schema for project analysis
 */
export const AnalyzeProjectOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

export type AnalyzeProjectOutput = z.infer<typeof AnalyzeProjectOutputSchema>;

/**
 * AI response structure (internal)
 */
interface ProjectAnalysisResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * analyzeProjectFlow
 *
 * Analyzes a GitHub project submission using AI.
 *
 * Infrastructure Layer - Uses Genkit and OpenAI to evaluate project quality
 * against expected skills and best practices.
 *
 * Evaluation Criteria:
 * - Code quality and organization
 * - Documentation (README, comments)
 * - Best practices and patterns
 * - Test coverage (if applicable)
 * - Relevance to expected skills
 *
 * @param input - Repository URL, files, and expected skills
 * @returns Analysis with score (0-100), feedback, strengths, and improvements
 */
export async function analyzeProjectFlow(
  input: AnalyzeProjectInput,
): Promise<AnalyzeProjectOutput> {
  // Validate input
  const validatedInput = AnalyzeProjectInputSchema.parse(input);

  try {
    const prompt = buildPrompt(validatedInput);

    const { text } = await ai.generate({
      model: openAI.model("gpt-4o-mini"),
      prompt,
      config: {
        temperature: 0.3, // Lower temperature for more consistent evaluations
      },
    });

    const cleaned = stripMarkdownCodeBlock(text);

    let response: ProjectAnalysisResponse;
    try {
      response = JSON.parse(cleaned);
    } catch {
      throw new Error(
        `AI_RESPONSE_FORMAT_ERROR: Failed to parse AI response as JSON. Raw output: ${text}`,
      );
    }

    // Validate response structure
    if (
      typeof response.score !== "number" ||
      response.score < 0 ||
      response.score > 100
    ) {
      throw new Error(
        `AI_RESPONSE_FORMAT_ERROR: Invalid score: ${response.score}`,
      );
    }

    if (!response.feedback || typeof response.feedback !== "string") {
      throw new Error("AI_RESPONSE_FORMAT_ERROR: Missing or invalid feedback");
    }

    if (
      !Array.isArray(response.strengths) ||
      !Array.isArray(response.improvements)
    ) {
      throw new Error(
        "AI_RESPONSE_FORMAT_ERROR: strengths and improvements must be arrays",
      );
    }

    // Return validated output
    return AnalyzeProjectOutputSchema.parse(response);
  } catch (error) {
    console.error("Error analyzing project:", error);
    throw error;
  }
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

/**
 * Builds the AI prompt for project analysis
 */
function buildPrompt(input: AnalyzeProjectInput): string {
  // Format files for prompt (limit content length to avoid token limits)
  const filesSummary = input.files
    .map((file) => {
      const contentPreview =
        file.content.length > 500
          ? file.content.substring(0, 500) + "... (truncated)"
          : file.content;
      return `--- ${file.path} ---\n${contentPreview}\n`;
    })
    .join("\n");

  return `You are a senior software engineer and teaching assistant evaluating a coding project submission for a specific learning module.

**LEARNING MODULE CONTEXT:**
Module Title: "${input.topic}"
Module Description: "${input.description}"
Expected Skills/Topics: ${input.expectedSkills}

**SUBMITTED PROJECT:**
Repository: ${input.repoUrl}

**PROJECT FILES:**
${filesSummary}

**🚨 CRITICAL INSTRUCTION - RELEVANCE CHECK FIRST:**

Before evaluating code quality, you MUST answer: Does the project use the CORRECT TECHNOLOGY/TOOLS and address the CORRECT PURPOSE?

**Step 1: Check Technology Match**
- Module asks for "Tableau dashboard" → Must use Tableau/Power BI
- Module asks for "React app" → Must use React
- Module asks for "Python script" → Must use Python
- Module asks for "REST API with Node.js" → Must use Node.js

**Step 2: Check Purpose Match**
- Module asks for "To-Do List" → Must be a To-Do List (not Calculator)
- Module asks for "Dashboard" → Must be a Dashboard (not CRUD app)

**If EITHER technology OR purpose is WRONG:**
- **Score: 0** (completely wrong technology/purpose)
- Feedback: "This project does not match the module requirements. Expected: [topic]. Received: [what they submitted]."
- Strengths: [] (empty)
- Improvements: ["Submit a project that addresses the module topic: {topic}"]
- **STOP HERE - Do NOT evaluate code quality**

**ONLY IF BOTH technology AND purpose are CORRECT, proceed with quality evaluation below:**

**EVALUATION CRITERIA (for relevant projects):**

1. **Relevance (40%)**: Does it directly address the module topic and description?
2. **Code Quality (25%)**: Clean code, proper naming, organization, readability
3. **Best Practices (20%)**: Design patterns, error handling, security considerations
4. **Documentation (10%)**: README quality, code comments
5. **Functionality (5%)**: Does it work? Is it complete?

**SCORING GUIDELINES:**

**FOR IRRELEVANT PROJECTS (wrong technology or wrong purpose):**
- **Score: 0** (ALWAYS)

**FOR RELEVANT PROJECTS (correct technology AND correct purpose):**
- **90-100**: Excellent - Professional quality, best practices followed, comprehensive implementation
- **70-89**: Good - Solid implementation with minor improvements needed (PASSING GRADE)
- **50-69**: Acceptable - Works but has significant quality issues (needs improvement)
- **30-49**: Poor - Major problems, minimal effort, or incomplete implementation

**INSTRUCTIONS:**

1. **Score (0-100)**: Strict score based on relevance FIRST, then quality
2. **Feedback (2-4 sentences)**: Start with relevance assessment, then quality
3. **Strengths (0-4 items)**: Specific things done well (empty if irrelevant)
4. **Improvements (1-4 items)**: Actionable suggestions (or "match the topic" if irrelevant)

**IMPORTANT:**
- Be strict about relevance - this is a learning platform, students must do the assigned work
- Be objective and constructive in feedback
- Consider this is a learning project, not production code
- If files are truncated, evaluate based on available content

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "score": 85,
  "feedback": "Concise feedback starting with relevance assessment...",
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "improvements": [
    "Specific improvement 1",
    "Specific improvement 2"
  ]
}

Analyze the project now.`;
}
