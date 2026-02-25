/**
 * IAnalyzeProjectFlow
 *
 * Domain port for AI-powered project analysis.
 * Infrastructure adapters (e.g., Genkit + OpenAI) implement this interface.
 */

export interface AnalyzeProjectInput {
  repoUrl: string;
  files: Array<{ path: string; content: string }>;
  topic: string;
  description: string;
  expectedSkills: string;
  acceptanceCriteria?: string[];
  technicalStack?: string[];
}

export interface AnalyzeProjectOutput {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface IAnalyzeProjectFlow {
  analyze(input: AnalyzeProjectInput): Promise<AnalyzeProjectOutput>;
}
