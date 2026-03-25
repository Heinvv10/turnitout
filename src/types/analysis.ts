export type RiskLevel = "low" | "medium" | "high";
export type TrafficLight = "green" | "yellow" | "red";
export type AIFlagType =
  | "perplexity"
  | "burstiness"
  | "vocabulary"
  | "transitions"
  | "patchwriting";

export interface AIFlag {
  type: AIFlagType;
  severity: RiskLevel;
  detail: string;
}

export interface ParagraphRisk {
  index: number;
  text: string;
  riskScore: number; // 0-100
  flags: AIFlag[];
  suggestion: string;
}

export interface AIRiskResult {
  overallScore: number; // 0-100
  trafficLight: TrafficLight;
  paragraphs: ParagraphRisk[];
  summary: string;
  topIssues: string[];
}

export interface CitationIssue {
  type:
    | "missing_citation"
    | "format_error"
    | "orphan_reference"
    | "orphan_citation"
    | "patchwriting";
  location: string;
  detail: string;
  suggestion: string;
}

export interface CitationResult {
  inTextCitations: string[];
  references: string[];
  issues: CitationIssue[];
  score: number; // 0-100
  trafficLight: TrafficLight;
}

export interface RubricScore {
  category: string;
  maxScore: number;
  score: number;
  feedback: string;
  improvements: string[];
}

export interface GradingResult {
  rubricScores: RubricScore[];
  totalScore: number; // 0-100
  saGrade: string;
  overallFeedback: string;
  strengths: string[];
  trafficLight: TrafficLight;
}

export interface SimilarityMatch {
  passage: string;
  matchType: "direct_copy" | "close_paraphrase" | "patchwriting" | "common_knowledge";
  similarityPercent: number;
  possibleSource: string;
  suggestion: string;
}

export interface PlagiarismResult {
  overallSimilarity: number; // 0-100
  trafficLight: TrafficLight;
  matches: SimilarityMatch[];
  summary: string;
  citedProperly: number; // count of properly cited passages
  uncitedMatches: number; // count of matches without citations
  selfPlagiarismRisk: boolean;
}

export interface SubmissionReadiness {
  aiRisk: AIRiskResult | null;
  citations: CitationResult | null;
  grading: GradingResult | null;
  plagiarism: PlagiarismResult | null;
  overall: number; // Weighted composite 0-100
  trafficLight: TrafficLight;
}
