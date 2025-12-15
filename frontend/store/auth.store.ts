
'use client';

import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
    authStatus: boolean
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    authStatus: false,
    user: null,
    setUser: (user: User | null) => set({ user, authStatus: true }),
    logout: () => set({ user: null, authStatus: false }),
}));
