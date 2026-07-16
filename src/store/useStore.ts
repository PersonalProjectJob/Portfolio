import { create } from 'zustand';

export type GameState = 'SELECT_PROFILE' | 'SKILL_MATRIX' | 'PROJECT_JOURNEY' | 'CASE_BRIEF' | 'CASE_STUDY_CRYPTOMAP' | 'CASE_STUDY_NAILHUB' | 'CASE_STUDY_NEXORA' | 'CASE_STUDY_VLINKPAY' | 'CASE_STUDY_AIPROCESS' | 'CASE_STUDY_HANDOFF' | 'CASE_STUDY_FINTECHFIT' | 'EXPERIENCE' | 'PROCESS';

interface AppState {
  gameState: GameState;
  selectedQuest: string | null;
  isLightMode: boolean;
  isManualTheme: boolean;
  
  // Actions
  setGameState: (state: GameState) => void;
  setSelectedQuest: (questId: string | null) => void;
  setIsLightMode: (isLight: boolean) => void;
  setIsManualTheme: (isManual: boolean) => void;
  toggleTheme: () => void;
  handleQuestSelect: (questId: string) => void;
}

const QUEST_STATE_MAP: Record<string, GameState> = {
  'cryptomap': 'CASE_STUDY_CRYPTOMAP',
  'nailhub': 'CASE_STUDY_NAILHUB',
  'nexora': 'CASE_STUDY_NEXORA',
  'vlinkpay': 'CASE_STUDY_VLINKPAY',
  'ai-process': 'CASE_STUDY_AIPROCESS',
  'handoff': 'CASE_STUDY_HANDOFF',
  'fintech-fit': 'CASE_STUDY_FINTECHFIT',
};

export const useStore = create<AppState>((set) => ({
  gameState: 'SELECT_PROFILE',
  selectedQuest: null,
  isLightMode: false,
  isManualTheme: false,

  setGameState: (state) => set({ gameState: state }),
  
  setSelectedQuest: (questId) => set({ selectedQuest: questId }),
  
  setIsLightMode: (isLight) => set({ isLightMode: isLight }),
  
  setIsManualTheme: (isManual) => set({ isManualTheme: isManual }),
  
  toggleTheme: () => set((state) => ({ 
    isLightMode: !state.isLightMode, 
    isManualTheme: true 
  })),

  handleQuestSelect: (questId: string) => set(() => ({
    selectedQuest: questId,
    gameState: QUEST_STATE_MAP[questId] || 'CASE_BRIEF',
  })),
}));
