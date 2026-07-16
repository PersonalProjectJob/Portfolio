import { create } from 'zustand';

export type AppName = 'figma' | 'photoshop' | 'illustrator' | 'gemini' | 'claude' | 'notes' | null;

interface AppState {
  openApp: AppName;
  setOpenApp: (app: AppName) => void;
}

export const useAppStore = create<AppState>((set) => ({
  openApp: null,
  setOpenApp: (app) => set({ openApp: app }),
}));
