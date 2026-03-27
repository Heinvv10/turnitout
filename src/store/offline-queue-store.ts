import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QueuedCheck {
  type: string;
  payload: object;
  timestamp: string;
}

interface OfflineQueueState {
  queue: QueuedCheck[];
  enqueue: (type: string, payload: object) => void;
  dequeue: () => QueuedCheck | undefined;
  getQueue: () => QueuedCheck[];
  clearQueue: () => void;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      enqueue: (type, payload) =>
        set({
          queue: [
            ...get().queue,
            { type, payload, timestamp: new Date().toISOString() },
          ],
        }),

      dequeue: () => {
        const current = get().queue;
        if (current.length === 0) return undefined;
        const [first, ...rest] = current;
        set({ queue: rest });
        return first;
      },

      getQueue: () => get().queue,

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: "turnitout-offline-queue",
    },
  ),
);
