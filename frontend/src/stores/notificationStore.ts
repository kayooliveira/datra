import { create } from 'zustand';

export type NotificationType = 'idle' | 'loading' | 'success' | 'error';

interface NotificationState {
    status: NotificationType;
    message: string;
    details?: string;
    
    // Actions
    setLoading: (message: string) => void;
    setSuccess: (message: string) => void;
    setError: (message: string, details?: string) => void;
    setIdle: () => void;
    
    // Auto-dismiss helper for success messages
    showSuccess: (message: string, duration?: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    status: 'idle',
    message: '',
    details: undefined,

    setLoading: (message) => set({ status: 'loading', message, details: undefined }),
    setSuccess: (message) => set({ status: 'success', message, details: undefined }),
    setError: (message, details) => set({ status: 'error', message, details }),
    setIdle: () => set({ status: 'idle', message: '', details: undefined }),

    showSuccess: (message, duration = 3000) => {
        set({ status: 'success', message, details: undefined });
        setTimeout(() => {
            // Only clear if we are still in the success state we just set
            if (get().status === 'success' && get().message === message) {
                set({ status: 'idle', message: '' });
            }
        }, duration);
    }
}));
