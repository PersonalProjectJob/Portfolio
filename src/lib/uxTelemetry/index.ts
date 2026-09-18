import { uxCollector } from './collector';
import { uxDispatcher } from './dispatcher';
import type {
  InitUxTelemetryOptions,
  UxFrictionType,
  UxSession,
} from './types';

export * from './types';

export function initUxTelemetry(options: InitUxTelemetryOptions): UxSession {
  return uxCollector.init(options);
}

export function observeSection(
  element: Element,
  sectionId: string,
  sectionOrder: number
): void {
  uxCollector.observeSection(element, sectionId, sectionOrder);
}

export function recordUxEvent(data: {
  pageSlug: string;
  sectionId: string;
  sectionOrder: number;
  dwellTimeMs: number;
  interacted?: boolean;
}): void {
  uxCollector.recordUxEvent(data);
}

export function recordFrictionEvent(data: {
  pageSlug: string;
  eventType: UxFrictionType;
  targetTag?: string;
  targetText?: string;
  targetSelector?: string;
  clickCount?: number;
  viewportX?: number;
  viewportY?: number;
}): void {
  uxCollector.recordFrictionEvent(data);
}

export function getUxSessionId(): string {
  return uxCollector.getSessionId();
}

export function destroyUxTelemetry(): void {
  uxCollector.destroy();
}

export function getStoredUxEvents() {
  return uxDispatcher.getStoredEvents();
}

export function getStoredUxSessions() {
  return uxDispatcher.getStoredSessions();
}

export function syncUxDataFromSupabase(): Promise<void> {
  return uxDispatcher.syncUxDataFromSupabase();
}

export function resetUxTelemetry(): void {
  uxDispatcher.reset();
}
