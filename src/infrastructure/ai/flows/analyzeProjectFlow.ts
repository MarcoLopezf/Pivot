import { ai } from "../genkit.config";
import { openAI } from "@genkit-ai/compat-oai/openai";
import {
  IAnalyzeProjectFlow,
  AnalyzeProjectInput,
  AnalyzeProjectOutput,
} from "@domain/assessment/services/IAnalyzeProjectFlow";
import {
  stripMarkdownCodeBlock,
  sanitizeForPrompt,
  wrapUserContent,
} from "../utils";
import { z } from "zod";

const AnalyzeProjectInputSchema = z.object({
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
  acceptanceCriteria: z.array(z.string()).optional(),
  technicalStack: z.array(z.string()).optional(),
});

const AnalyzeProjectOutputSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
});

/**
 * GenkitProjectAnalysisFlow
 *
 * Infrastructure adapter that implements IAnalyzeProjectFlow using Genkit and OpenAI.
 * Analyzes a GitHub project submission against expected skills and best practices.
 */
export class GenkitProjectAnalysisFlow implements IAnalyzeProjectFlow {
  async analyze(input: AnalyzeProjectInput): Promise<AnalyzeProjectOutput> {
    const validatedInput = AnalyzeProjectInputSchema.parse(input);

    try {
      const prompt = this.buildPrompt(validatedInput);

      const { text } = await ai.generate({
        model: openAI.model("gpt-4.1-mini"),
        prompt,
        config: {
          temperature: 0.3,
        },
      });

      const cleaned = stripMarkdownCodeBlock(text);

      let parsed: z.infer<typeof AnalyzeProjectOutputSchema>;
      try {
        parsed = AnalyzeProjectOutputSchema.parse(JSON.parse(cleaned));
      } catch {
        throw new Error(
          `AI_RESPONSE_FORMAT_ERROR: Failed to parse AI response as JSON. Raw output: ${text}`,
        );
      }

      return parsed;
    } catch (error) {
      console.error("Error analyzing project:", error);
      throw error;
    }
  }

  private buildPrompt(input: AnalyzeProjectInput): string {
    const filesSummary = input.files
      .map((file) => {
        const sanitizedPath = sanitizeForPrompt(file.path, 500);
        const contentPreview = sanitizeForPrompt(file.content, 2000);
        return `<file_content path="${sanitizedPath}">\n${contentPreview}\n</file_content>`;
      })
      .join("\n\n");

    let acceptanceCriteriaSection = "";
    if (input.acceptanceCriteria && input.acceptanceCriteria.length > 0) {
      acceptanceCriteriaSection = `
**ACCEPTANCE CRITERIA (student must fulfill these):**
${input.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}
`;
    }

    let technicalStackSection = "";
    if (input.technicalStack && input.technicalStack.length > 0) {
      technicalStackSection = `
**EXPECTED TECHNICAL STACK:**
${input.technicalStack.join(", ")}
`;
    }

    const hasDetailedCriteria =
      input.acceptanceCriteria && input.acceptanceCriteria.length > 0;

    return `You are a senior software engineer and teaching assistant evaluating a coding project submission for a specific learning module.

**LEARNING MODULE CONTEXT:**
${wrapUserContent("module_topic", input.topic)}
${wrapUserContent("module_description", input.description)}
Expected Skills/Topics: ${input.expectedSkills}
${acceptanceCriteriaSection}${technicalStackSection}
**SUBMITTED PROJECT:**
${wrapUserContent("repository_url", input.repoUrl)}

**PROJECT FILES:**
${filesSummary}

**CRITICAL INSTRUCTION - RELEVANCE CHECK FIRST:**

Before evaluating code quality, you MUST answer: Does the project use the CORRECT TECHNOLOGY/TOOLS and address the CORRECT PURPOSE?

**Step 1: Check Technology Match**
${input.technicalStack && input.technicalStack.length > 0 ? `- Project must use technologies from the expected stack: ${input.technicalStack.join(", ")}` : `- Module asks for the technologies in: ${input.expectedSkills}`}

**Step 2: Check Purpose Match**
- The project must address the module topic: "${input.topic}"

**If EITHER technology OR purpose is WRONG:**
- **Score: 0** (completely wrong technology/purpose)
- Feedback: "This project does not match the module requirements. Expected: [topic]. Received: [what they submitted]."
- Strengths: [] (empty)
- Improvements: ["Submit a project that addresses the module topic: {topic}"]
- **STOP HERE - Do NOT evaluate code quality**

**ONLY IF BOTH technology AND purpose are CORRECT, proceed with quality evaluation below:**

**EVALUATION CRITERIA (for relevant projects):**

${
  hasDetailedCriteria
    ? `1. **Acceptance Criteria Fulfillment (40%)**: Does the project meet the specific acceptance criteria listed above? Check each criterion individually.
2. **Code Quality (25%)**: Clean code, proper naming, organization, readability
3. **Best Practices (20%)**: Design patterns, error handling, security considerations
4. **Documentation (10%)**: README quality, code comments, setup instructions
5. **Functionality (5%)**: Does it work? Is it complete?`
    : `1. **Relevance (40%)**: Does it directly address the module topic and description?
2. **Code Quality (25%)**: Clean code, proper naming, organization, readability
3. **Best Practices (20%)**: Design patterns, error handling, security considerations
4. **Documentation (10%)**: README quality, code comments
5. **Functionality (5%)**: Does it work? Is it complete?`
}

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
2. **Feedback (2-4 sentences)**: Start with relevance assessment, then quality${hasDetailedCriteria ? ". Mention which acceptance criteria were met and which were not." : ""}
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
}
