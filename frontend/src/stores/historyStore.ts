import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryEntry {
    id: string;
    query: string;
    timestamp: number;
    status: 'success' | 'error';
    duration?: number;
    rowsAffected?: number;
}

interface HistoryState {
    history: Record<string, HistoryEntry[]>; // Map sessionId -> entries
    addEntry: (sessionId: string, entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
    clearHistory: (sessionId: string) => void;
    getHistory: (sessionId: string) => HistoryEntry[];
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set, get) => ({
            history: {},
            addEntry: (sessionId, entry) => set((state) => {
                const sessionHistory = state.history[sessionId] || [];
                const newEntry: HistoryEntry = {
                    ...entry,
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                };
                return {
                    history: {
                        ...state.history,
                        [sessionId]: [newEntry, ...sessionHistory].slice(0, 50) // Keep last 50
                    }
                };
            }),
            clearHistory: (sessionId) => set((state) => {
                const newHistory = { ...state.history };
                delete newHistory[sessionId];
                return { history: newHistory };
            }),
            getHistory: (sessionId) => get().history[sessionId] || [],
        }),
        {
            name: 'query-history-storage',
        }
    )
);
