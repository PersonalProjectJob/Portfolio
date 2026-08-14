import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Legacy Project Component Registry
 * Maps legacy case study keys to dynamic lazy-loaded React components.
 */
export const legacyProjectRegistry: Record<string, LazyExoticComponent<ComponentType<any>>> = {
  'cryptomap': lazy(() => import('../../pages/ProjectCryptomap').then(m => ({ default: m.ProjectCryptomap }))),
  'nailhub': lazy(() => import('../../pages/ProjectNailhub').then(m => ({ default: m.ProjectNailhub }))),
  'nexora': lazy(() => import('../../pages/ProjectNexora').then(m => ({ default: m.ProjectNexora }))),
  'vlinkpay': lazy(() => import('../../pages/ProjectVlinkpay').then(m => ({ default: m.ProjectVlinkpay }))),
  'ai-process': lazy(() => import('../../pages/ProjectAIProcess').then(m => ({ default: m.ProjectAIProcess }))),
  'handoff': lazy(() => import('../../pages/ProjectHandoff').then(m => ({ default: m.ProjectHandoff }))),
  'sync-task-badge': lazy(() => import('../../pages/ProjectSyncTaskBadge')),
  'dispatch': lazy(() => import('../../pages/ProjectDispatch').then(m => ({ default: m.ProjectDispatch }))),
  'agent-rules': lazy(() => import('../../pages/ProjectAgentRules').then(m => ({ default: m.ProjectAgentRules }))),
};

/**
 * Retrieves a lazy-loaded component by its legacy key.
 * Returns null if no matching component is found in the registry.
 */
export function getLegacyComponent(key: string): LazyExoticComponent<ComponentType<any>> | null {
  return legacyProjectRegistry[key] || null;
}
