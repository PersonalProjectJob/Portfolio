import type { ComponentType, LazyExoticComponent } from 'react';
import { lazyWithRetry } from '../../utils/lazyWithRetry.ts';

/**
 * Legacy Project Component Registry
 * Maps legacy case study keys to dynamic lazy-loaded React components with stale chunk reload protection.
 */
export const legacyProjectRegistry: Record<string, LazyExoticComponent<ComponentType<any>>> = {
  'cryptomap': lazyWithRetry(() => import('../../pages/ProjectCryptomap').then(m => ({ default: m.ProjectCryptomap }))),
  'nailhub': lazyWithRetry(() => import('../../pages/ProjectNailhub').then(m => ({ default: m.ProjectNailhub }))),
  'nexora': lazyWithRetry(() => import('../../pages/ProjectNexora').then(m => ({ default: m.ProjectNexora }))),
  'vlinkpay': lazyWithRetry(() => import('../../pages/ProjectVlinkpay').then(m => ({ default: m.ProjectVlinkpay }))),
  'ai-process': lazyWithRetry(() => import('../../pages/ProjectAIProcess').then(m => ({ default: m.ProjectAIProcess }))),
  'handoff': lazyWithRetry(() => import('../../pages/ProjectHandoff').then(m => ({ default: m.ProjectHandoff }))),
  'sync-task-badge': lazyWithRetry(() => import('../../pages/ProjectSyncTaskBadge')),
  'dispatch': lazyWithRetry(() => import('../../pages/ProjectDispatch').then(m => ({ default: m.ProjectDispatch }))),
  'agent-rules': lazyWithRetry(() => import('../../pages/ProjectAgentRules').then(m => ({ default: m.ProjectAgentRules }))),
  'agent-handoff': lazyWithRetry(() => import('../../pages/ProjectAgentHandoff').then(m => ({ default: m.ProjectAgentHandoff }))),
};

/**
 * Retrieves a lazy-loaded component by its legacy key.
 * Returns null if no matching component is found in the registry.
 */
export function getLegacyComponent(key: string): LazyExoticComponent<ComponentType<any>> | null {
  return legacyProjectRegistry[key] || null;
}
