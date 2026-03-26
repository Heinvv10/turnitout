import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DraftSnapshot {
  id: string;
  timestamp: string;
  moduleCode: string;
  wordCount: number;
  scores: {
    readability: number;
    grammar: number;
    citations: number;
    similarity: number;
    aiRisk: number;
    grade: number;
    overall: number;
  };
}

interface DraftHistoryState {
  snapshots: Record<string, DraftSnapshot[]>;
  addSnapshot: (moduleCode: string, snapshot: DraftSnapshot) => void;
  getSnapshots: (moduleCode: string) => DraftSnapshot[];
  clearModule: (moduleCode: string) => void;
}

export const useDraftHistoryStore = create<DraftHistoryState>()(
  persist(
    (set, get) => ({
      snapshots: {},
      addSnapshot: (moduleCode, snapshot) => {
        const current = get().snapshots[moduleCode] ?? [];
        set({
          snapshots: {
            ...get().snapshots,
            [moduleCode]: [...current, snapshot].slice(-20),
          },
        });
      },
      getSnapshots: (moduleCode) => get().snapshots[moduleCode] ?? [],
      clearModule: (moduleCode) => {
        const updated = { ...get().snapshots };
        delete updated[moduleCode];
        set({ snapshots: updated });
      },
    }),
    { name: "turnitout-draft-history" },
  ),
);
