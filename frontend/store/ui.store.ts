'use client';

import { create } from 'zustand';

const DEFAULT_HEADER_COMPONENT = null
const DEFAULT_LOADING = false;

interface UiState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    headerComponent: React.ReactNode;
    setHeaderComponent: (headerComponent: React.ReactNode) => void;
}

export const useUiStore = create<UiState>((set) => ({
    loading: DEFAULT_LOADING,
    setLoading: (loading: boolean) => set({ loading }),
    headerComponent: DEFAULT_HEADER_COMPONENT,
    setHeaderComponent: (headerComponent: React.ReactNode) => set({ headerComponent }),
}));