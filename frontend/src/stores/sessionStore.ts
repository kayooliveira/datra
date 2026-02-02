import { create } from 'zustand';

interface SessionState {
    activeSessionId: string | null;
    setActiveSessionId: (id: string | null) => void;
    isCreatingConnection: boolean;
    setIsCreatingConnection: (isCreating: boolean) => void;
    isConnectingSession: boolean;
    setIsConnectingSession: (isConnecting: boolean) => void;
    activeContext: {
        database?: string;
        schema?: string;
    } | null;
    setActiveContext: (context: { database?: string; schema?: string } | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    activeSessionId: null,
    setActiveSessionId: (id) => set({ activeSessionId: id }),
    isCreatingConnection: false,
    setIsCreatingConnection: (isCreating) => set({ isCreatingConnection: isCreating }),
    isConnectingSession: false,
    setIsConnectingSession: (isConnecting) => set({ isConnectingSession: isConnecting }),
    activeContext: null,
    setActiveContext: (context) => set({ activeContext: context }),
}));
