import { create } from 'zustand';

export type GameState = 'HERO_LANDING' | 'SELECT_PROFILE' | 'SKILL_MATRIX' | 'PROJECT_JOURNEY' | 'CASE_BRIEF' | 'CASE_STUDY_CRYPTOMAP' | 'CASE_STUDY_NAILHUB' | 'CASE_STUDY_NEXORA' | 'CASE_STUDY_VLINKPAY' | 'CASE_STUDY_AIPROCESS' | 'CASE_STUDY_HANDOFF' | 'CASE_STUDY_FINTECHFIT' | 'CASE_STUDY_DISPATCH' | 'CASE_STUDY_AGENTRULES' | 'EXPERIENCE' | 'PROCESS';

// --- URL ↔ State mapping ---

const STATE_TO_URL: Record<GameState, string> = {
  HERO_LANDING: '/',
  SELECT_PROFILE: '/profile',
  SKILL_MATRIX: '/skills',
  PROJECT_JOURNEY: '/projects',
  CASE_BRIEF: '/brief',
  CASE_STUDY_CRYPTOMAP: '/project/cryptomap',
  CASE_STUDY_NAILHUB: '/project/nailhub',
  CASE_STUDY_NEXORA: '/project/nexora',
  CASE_STUDY_VLINKPAY: '/project/vlinkpay',
  CASE_STUDY_AIPROCESS: '/project/ai-process',
  CASE_STUDY_HANDOFF: '/project/handoff',
  CASE_STUDY_FINTECHFIT: '/project/fintech-fit',
  CASE_STUDY_DISPATCH: '/project/dispatch',
  CASE_STUDY_AGENTRULES: '/project/agent-rules',
  EXPERIENCE: '/experience',
  PROCESS: '/process',
};

// Reverse lookup: URL path → { gameState, selectedQuest? }
const URL_TO_STATE: Record<string, { gameState: GameState; selectedQuest?: string }> = {
  '/': { gameState: 'HERO_LANDING' },
  '/profile': { gameState: 'SELECT_PROFILE' },
  '/skills': { gameState: 'SKILL_MATRIX' },
  '/projects': { gameState: 'PROJECT_JOURNEY' },
  '/brief': { gameState: 'CASE_BRIEF' },
  '/project/cryptomap': { gameState: 'CASE_STUDY_CRYPTOMAP', selectedQuest: 'cryptomap' },
  '/project/nailhub': { gameState: 'CASE_STUDY_NAILHUB', selectedQuest: 'nailhub' },
  '/project/nexora': { gameState: 'CASE_STUDY_NEXORA', selectedQuest: 'nexora' },
  '/project/vlinkpay': { gameState: 'CASE_STUDY_VLINKPAY', selectedQuest: 'vlinkpay' },
  '/project/ai-process': { gameState: 'CASE_STUDY_AIPROCESS', selectedQuest: 'ai-process' },
  '/project/handoff': { gameState: 'CASE_STUDY_HANDOFF', selectedQuest: 'handoff' },
  '/project/fintech-fit': { gameState: 'CASE_STUDY_FINTECHFIT', selectedQuest: 'fintech-fit' },
  '/project/dispatch': { gameState: 'CASE_STUDY_DISPATCH', selectedQuest: 'dispatch' },
  '/project/agent-rules': { gameState: 'CASE_STUDY_AGENTRULES', selectedQuest: 'agent-rules' },
  '/experience': { gameState: 'EXPERIENCE' },
  '/process': { gameState: 'PROCESS' },
};

/** Resolve initial state from current URL pathname */
export function resolveStateFromURL(): { gameState: GameState; selectedQuest: string | null } {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const match = URL_TO_STATE[path];
  if (match) {
    return { gameState: match.gameState, selectedQuest: match.selectedQuest ?? null };
  }
  return { gameState: 'HERO_LANDING', selectedQuest: null };
}

/** Push URL to browser history without triggering popstate */
function pushURL(state: GameState) {
  const url = STATE_TO_URL[state] || '/';
  if (window.location.pathname !== url) {
    window.history.pushState({ gameState: state }, '', url);
  }
}

/** Replace current URL (for init, no history entry) */
export function replaceURL(state: GameState) {
  const url = STATE_TO_URL[state] || '/';
  window.history.replaceState({ gameState: state }, '', url);
}

// --- Quest → GameState mapping ---

const QUEST_STATE_MAP: Record<string, GameState> = {
  'cryptomap': 'CASE_STUDY_CRYPTOMAP',
  'nailhub': 'CASE_STUDY_NAILHUB',
  'nexora': 'CASE_STUDY_NEXORA',
  'vlinkpay': 'CASE_STUDY_VLINKPAY',
  'ai-process': 'CASE_STUDY_AIPROCESS',
  'handoff': 'CASE_STUDY_HANDOFF',
  'fintech-fit': 'CASE_STUDY_FINTECHFIT',
  'dispatch': 'CASE_STUDY_DISPATCH',
  'agent-rules': 'CASE_STUDY_AGENTRULES',
};

// --- Store ---

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
  /** Sync state from URL (used by popstate listener) — does NOT push history */
  syncFromURL: () => void;
}

const initialState = resolveStateFromURL();

export const useStore = create<AppState>((set) => ({
  gameState: initialState.gameState,
  selectedQuest: initialState.selectedQuest,
  isLightMode: false,
  isManualTheme: false,

  setGameState: (state) => {
    pushURL(state);
    set({ gameState: state });
  },
  
  setSelectedQuest: (questId) => set({ selectedQuest: questId }),
  
  setIsLightMode: (isLight) => set({ isLightMode: isLight }),
  
  setIsManualTheme: (isManual) => set({ isManualTheme: isManual }),
  
  toggleTheme: () => set((s) => ({ 
    isLightMode: !s.isLightMode, 
    isManualTheme: true 
  })),

  handleQuestSelect: (questId: string) => {
    const gameState = QUEST_STATE_MAP[questId] || 'CASE_BRIEF';
    pushURL(gameState);
    set({ selectedQuest: questId, gameState });
  },

  syncFromURL: () => {
    const resolved = resolveStateFromURL();
    set({ gameState: resolved.gameState, selectedQuest: resolved.selectedQuest });
  },
}));
