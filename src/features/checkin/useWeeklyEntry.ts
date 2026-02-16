import { useEffect, useMemo, useState } from 'react';
import { healthConfig } from '../../config/healthConfig';
import { getIsoWeekInfo } from '../../domain/isoWeek';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

export function createDefaultEntry(isoWeekKey?: string): WeeklyEntry {
  const week = isoWeekKey ? parseWeek(isoWeekKey) : getIsoWeekInfo();
  const items = Object.fromEntries(
    healthConfig.dimensions.flatMap((d) => d.subcategories.map((s) => [s.id, { score: 5, note: '' }]))
  );
  return { ...week, status: 'draft', items, updatedAt: new Date().toISOString() };
}

function parseWeek(isoWeekKey: string) {
  const [yearPart, weekPart] = isoWeekKey.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  const current = getIsoWeekInfo();
  return { ...current, year, week, isoWeekKey };
}

export function useWeeklyEntry(isoWeekKey: string) {
  const [entry, setEntry] = useState<WeeklyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    weeklyEntryStore.getByWeek(isoWeekKey).then((saved) => {
      setEntry(saved ?? createDefaultEntry(isoWeekKey));
      setLoading(false);
    });
  }, [isoWeekKey]);

  return useMemo(() => ({ entry, setEntry, loading }), [entry, loading]);
}
