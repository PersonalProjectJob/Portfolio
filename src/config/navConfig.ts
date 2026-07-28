import type { GameState } from '../store/useStore';

export interface NavItem {
  id: GameState;
  label: string;
  icon: 'user' | 'star' | 'activity';
  matchStates?: GameState[];
  isCenter?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'SELECT_PROFILE', label: 'Profile', icon: 'user' },
  { id: 'SKILL_MATRIX', label: 'Skills', icon: 'star', isCenter: true },
  { id: 'PROJECT_JOURNEY', label: 'Journey', icon: 'activity', matchStates: ['CASE_BRIEF'] },
];

/** Check if a given gameState should highlight a specific nav item */
export function isNavActive(item: NavItem, currentState: GameState): boolean {
  if (item.id === currentState) return true;
  return item.matchStates?.includes(currentState) ?? false;
}
