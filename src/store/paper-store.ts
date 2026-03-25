import { create } from "zustand";
import type { Paper } from "@/types/paper";
import type {
  AIRiskResult,
  CitationResult,
  GradingResult,
  PlagiarismResult,
  SubmissionReadiness,
  TrafficLight,
} from "@/types/analysis";

interface PaperState {
  currentPaper: Paper | null;
  analysisResults: SubmissionReadiness;
  isAnalyzing: { aiRisk: boolean; citations: boolean; grading: boolean; plagiarism: boolean };
  resultsStale: boolean;

  setPaper: (paper: Paper) => void;
  updateContent: (html: string, plainText: string, wordCount: number) => void;
  updateReferences: (html: string, plainText: string) => void;
  setAIRiskResult: (result: AIRiskResult) => void;
  setCitationResult: (result: CitationResult) => void;
  setGradingResult: (result: GradingResult) => void;
  setPlagiarismResult: (result: PlagiarismResult) => void;
  setAnalyzing: (
    key: "aiRisk" | "citations" | "grading" | "plagiarism",
    value: boolean,
  ) => void;
  clearResults: () => void;
  markStale: () => void;
}

function computeOverall(results: SubmissionReadiness): {
  overall: number;
  trafficLight: TrafficLight;
} {
  const scores: number[] = [];
  if (results.aiRisk) scores.push(100 - results.aiRisk.overallScore);
  if (results.citations) scores.push(results.citations.score);
  if (results.grading) scores.push(results.grading.totalScore);
  if (results.plagiarism) scores.push(100 - results.plagiarism.overallSimilarity);

  if (scores.length === 0) return { overall: 0, trafficLight: "red" };

  const overall = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length,
  );
  const trafficLight: TrafficLight =
    overall >= 70 ? "green" : overall >= 50 ? "yellow" : "red";
  return { overall, trafficLight };
}

const emptyResults: SubmissionReadiness = {
  aiRisk: null,
  citations: null,
  grading: null,
  plagiarism: null,
  overall: 0,
  trafficLight: "red",
};

export const usePaperStore = create<PaperState>((set, get) => ({
  currentPaper: null,
  analysisResults: { ...emptyResults },
  isAnalyzing: { aiRisk: false, citations: false, grading: false, plagiarism: false },
  resultsStale: false,

  setPaper: (paper) => set({ currentPaper: paper, resultsStale: false }),

  updateContent: (html, plainText, wordCount) => {
    const current = get().currentPaper;
    if (!current) return;
    set({
      currentPaper: {
        ...current,
        content: html,
        plainText,
        wordCount,
        updatedAt: new Date().toISOString(),
      },
      resultsStale: get().analysisResults.aiRisk !== null,
    });
  },

  updateReferences: (html, plainText) => {
    const current = get().currentPaper;
    if (!current) return;
    const count = plainText
      .split("\n")
      .filter((l) => l.trim().length > 10).length;
    set({
      currentPaper: {
        ...current,
        referencesHtml: html,
        references: plainText,
        referenceCount: count,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setAIRiskResult: (result) => {
    const results = { ...get().analysisResults, aiRisk: result };
    const { overall, trafficLight } = computeOverall(results);
    set({ analysisResults: { ...results, overall, trafficLight } });
  },

  setCitationResult: (result) => {
    const results = { ...get().analysisResults, citations: result };
    const { overall, trafficLight } = computeOverall(results);
    set({ analysisResults: { ...results, overall, trafficLight } });
  },

  setGradingResult: (result) => {
    const results = { ...get().analysisResults, grading: result };
    const { overall, trafficLight } = computeOverall(results);
    set({ analysisResults: { ...results, overall, trafficLight } });
  },

  setPlagiarismResult: (result) => {
    const results = { ...get().analysisResults, plagiarism: result };
    const { overall, trafficLight } = computeOverall(results);
    set({ analysisResults: { ...results, overall, trafficLight } });
  },

  setAnalyzing: (key, value) =>
    set({ isAnalyzing: { ...get().isAnalyzing, [key]: value } }),

  clearResults: () =>
    set({ analysisResults: { ...emptyResults }, resultsStale: false }),

  markStale: () => set({ resultsStale: true }),
}));
