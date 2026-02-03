import { create } from 'zustand';

interface SessionState {
    activeSessionId: string | null;
    setActiveSessionId: (id: string | null) => void;
    isCreatingConnection: boolean;
    setIsCreatingConnection: (isCreating: boolean) => void;
    isConnectingSession: boolean;
    setIsConnectingSession: (isConnecting: boolean) => void;
    
    // Map sessionId -> Context
    sessionContexts: Record<string, { database?: string; schema?: string }>;
    setSessionContext: (sessionId: string, context: { database?: string; schema?: string } | null) => void;
    
    // Deprecated: activeContext (computed property helpers can be added if needed, but we'll remove it)
}

export const useSessionStore = create<SessionState>((set) => ({
    activeSessionId: null,
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    isCreatingConnection: false,
    setIsCreatingConnection: (isCreating) => set({ isCreatingConnection: isCreating }),
    isConnectingSession: false,
    setIsConnectingSession: (isConnecting) => set({ isConnectingSession: isConnecting }),
    
    sessionContexts: {},
    setSessionContext: (sessionId, context) => set((state) => {
        if (!context) {
            const newContexts = { ...state.sessionContexts };
            delete newContexts[sessionId];
            return { sessionContexts: newContexts };
        }
        return {
            sessionContexts: {
                ...state.sessionContexts,
                [sessionId]: { ...state.sessionContexts[sessionId], ...context }
            }
        };
    }),
}));
