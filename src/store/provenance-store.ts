import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProvenanceEventType = "typed" | "pasted" | "deleted" | "revised";

export interface ProvenanceEvent {
  type: ProvenanceEventType;
  wordCount: number;
  timestamp: string;
  charDelta: number;
}

export interface ProvenanceStats {
  totalTyped: number;
  totalPasted: number;
  totalDeleted: number;
  revisions: number;
  firstEdit: string | null;
  lastEdit: string | null;
  sessionCount: number;
}

const MAX_EVENTS_PER_MODULE = 500;

interface ProvenanceState {
  events: Record<string, ProvenanceEvent[]>;
  addEvent: (
    moduleCode: string,
    type: ProvenanceEventType,
    charDelta: number,
    wordCount: number,
  ) => void;
  getStats: (moduleCode: string) => ProvenanceStats;
  getEvents: (moduleCode: string) => ProvenanceEvent[];
  clearModule: (moduleCode: string) => void;
}

/** Detect session boundaries: gaps of 30+ minutes between events */
function countSessions(events: ProvenanceEvent[]): number {
  if (events.length === 0) return 0;
  let sessions = 1;
  const SESSION_GAP_MS = 30 * 60 * 1000;
  for (let i = 1; i < events.length; i++) {
    const prev = new Date(events[i - 1].timestamp).getTime();
    const curr = new Date(events[i].timestamp).getTime();
    if (curr - prev > SESSION_GAP_MS) {
      sessions++;
    }
  }
  return sessions;
}

export const useProvenanceStore = create<ProvenanceState>()(
  persist(
    (set, get) => ({
      events: {},

      addEvent: (moduleCode, type, charDelta, wordCount) => {
        const current = get().events[moduleCode] ?? [];
        const newEvent: ProvenanceEvent = {
          type,
          wordCount,
          timestamp: new Date().toISOString(),
          charDelta,
        };
        const updated = [...current, newEvent].slice(-MAX_EVENTS_PER_MODULE);
        set({
          events: {
            ...get().events,
            [moduleCode]: updated,
          },
        });
      },

      getStats: (moduleCode) => {
        const events = get().events[moduleCode] ?? [];
        const totalTyped = events
          .filter((e) => e.type === "typed")
          .reduce((sum, e) => sum + e.charDelta, 0);
        const totalPasted = events
          .filter((e) => e.type === "pasted")
          .reduce((sum, e) => sum + e.charDelta, 0);
        const totalDeleted = events
          .filter((e) => e.type === "deleted")
          .reduce((sum, e) => sum + Math.abs(e.charDelta), 0);
        const revisions = events.filter((e) => e.type === "revised").length;
        const firstEdit = events.length > 0 ? events[0].timestamp : null;
        const lastEdit =
          events.length > 0 ? events[events.length - 1].timestamp : null;
        const sessionCount = countSessions(events);

        return {
          totalTyped,
          totalPasted,
          totalDeleted,
          revisions,
          firstEdit,
          lastEdit,
          sessionCount,
        };
      },

      getEvents: (moduleCode) => get().events[moduleCode] ?? [],

      clearModule: (moduleCode) => {
        const updated = { ...get().events };
        delete updated[moduleCode];
        set({ events: updated });
      },
    }),
    { name: "turnitout-provenance" },
  ),
);
