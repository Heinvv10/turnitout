import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SubmissionReadiness } from "@/types/analysis";

export interface HistoryEntry {
  id: string;
  paperTitle: string;
  moduleCode: string;
  timestamp: string;
  wordCount: number;
  readiness: SubmissionReadiness;
}

interface HistoryState {
  entries: HistoryEntry[];
  addEntry: (entry: HistoryEntry) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set({ entries: [entry, ...get().entries].slice(0, 50) }),
      removeEntry: (id) =>
        set({ entries: get().entries.filter((e) => e.id !== id) }),
      clearAll: () => set({ entries: [] }),
    }),
    { name: "turnitout-history" },
  ),
);
