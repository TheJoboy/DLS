import type { HealthConfig } from '../config/types';
import type { ImportConflict, WeeklyEntry } from './models';

export type ExportPayload = { configVersion: string; entries: WeeklyEntry[] };

export function createExport(configVersion: string, entries: WeeklyEntry[]): ExportPayload {
  return { configVersion, entries };
}

export function detectConflicts(existing: WeeklyEntry[], incoming: WeeklyEntry[]) {
  const byWeek = new Map(existing.map((e) => [e.isoWeekKey, e]));
  return incoming
    .filter((entry) => byWeek.has(entry.isoWeekKey))
    .map((entry) => ({ isoWeekKey: entry.isoWeekKey, existing: byWeek.get(entry.isoWeekKey)!, incoming: entry })) satisfies ImportConflict[];
}

export function validatePayload(payload: unknown, config: HealthConfig): payload is ExportPayload {
  if (!payload || typeof payload !== 'object') return false;
  const maybe = payload as ExportPayload;
  return maybe.configVersion === config.configVersion && Array.isArray(maybe.entries);
}
