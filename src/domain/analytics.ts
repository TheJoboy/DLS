import type { HealthConfig } from '../config/types';
import type { WeeklyEntry } from './models';

export function avg(values: number[]) {
  if (!values.length) return 0;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
}

export function getDimensionAverage(entry: WeeklyEntry, dimensionId: string, config: HealthConfig) {
  const dimension = config.dimensions.find((d) => d.id === dimensionId);
  if (!dimension) return null;
  const values = dimension.subcategories
    .map((s) => entry.items[s.id]?.score)
    .filter((v): v is number => typeof v === 'number');
  return values.length ? avg(values) : null;
}

export function buildSeries(entries: WeeklyEntry[], config: HealthConfig, mode: 'subcategory' | 'dimension', targetId: string) {
  return [...entries]
    .sort((a, b) => a.isoWeekKey.localeCompare(b.isoWeekKey))
    .map((entry) => {
      const value = mode === 'subcategory' ? entry.items[targetId]?.score ?? null : getDimensionAverage(entry, targetId, config);
      return { week: entry.isoWeekKey, value, note: mode === 'subcategory' ? entry.items[targetId]?.note ?? '' : '' };
    })
    .filter((p) => p.value !== null);
}

export function getStats(values: Array<number | null>) {
  const present = values.filter((v): v is number => typeof v === 'number');
  if (!present.length) return { min: 0, max: 0, avg: 0, trend: 0 };
  return {
    min: Math.min(...present),
    max: Math.max(...present),
    avg: avg(present),
    trend: Number((present[present.length - 1] - present[0]).toFixed(2))
  };
}
