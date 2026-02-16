import { describe, expect, it } from 'vitest';
import { healthConfig } from '../config/healthConfig';
import { buildSeries, getDimensionAverage } from '../domain/analytics';
import { detectConflicts } from '../domain/importExport';
import type { WeeklyEntry } from '../domain/models';

class FakePersistence {
  private static backing = new Map<string, WeeklyEntry>();
  async upsert(entry: WeeklyEntry) { FakePersistence.backing.set(entry.isoWeekKey, entry); }
  async getByWeek(key: string) { return FakePersistence.backing.get(key); }
  async getAll() { return [...FakePersistence.backing.values()].sort((a,b) => b.isoWeekKey.localeCompare(a.isoWeekKey)); }
  async clear() { FakePersistence.backing.clear(); }
}

function makeEntry(week: string, status: 'draft' | 'submitted', overrides: Partial<WeeklyEntry['items']> = {}): WeeklyEntry {
  return {
    isoWeekKey: week,
    year: 2026,
    week: Number(week.split('-W')[1]),
    dateFrom: '2026-01-01',
    dateTo: '2026-01-07',
    status,
    updatedAt: new Date().toISOString(),
    items: {
      sleep: { score: 6, note: '' },
      energy: { score: 8, note: '' },
      movement: { score: 4, note: '' },
      focus: { score: 5, note: '' },
      stress: { score: 7, note: '' },
      mood: { score: 7, note: '' },
      connection: { score: 6, note: '' },
      support: { score: 9, note: '' },
      boundaries: { score: 5, note: '' },
      ...overrides
    }
  };
}

describe('Akzeptanztests', () => {
  it('persistiert Daten nach Neustart (neue Store-Instanz)', async () => {
    const storeA = new FakePersistence();
    await storeA.clear();
    await storeA.upsert(makeEntry('2026-W05', 'draft', { sleep: { score: 9, note: 'sehr gut' } }));

    const storeB = new FakePersistence();
    const loaded = await storeB.getByWeek('2026-W05');
    expect(loaded?.items.sleep.score).toBe(9);
  });

  it('zeigt Submit-Status in Auswertung (drafts optional)', () => {
    const entries = [makeEntry('2026-W01', 'draft'), makeEntry('2026-W02', 'submitted', { sleep: { score: 10, note: 'top' } })];
    const submittedOnly = buildSeries(entries.filter((e) => e.status === 'submitted'), healthConfig, 'subcategory', 'sleep');
    const withDrafts = buildSeries(entries, healthConfig, 'subcategory', 'sleep');
    expect(submittedOnly).toHaveLength(1);
    expect(withDrafts).toHaveLength(2);
  });

  it('berechnet Dimensions-Durchschnitt korrekt', () => {
    const entry = makeEntry('2026-W03', 'submitted', { sleep: { score: 3, note: '' }, energy: { score: 6, note: '' }, movement: { score: 9, note: '' } });
    const average = getDimensionAverage(entry, 'body', healthConfig);
    expect(average).toBe(6);
  });

  it('Export/Import Konflikte werden erkannt', () => {
    const existing = [makeEntry('2026-W10', 'submitted')];
    const incoming = [makeEntry('2026-W10', 'draft'), makeEntry('2026-W11', 'draft')];
    const conflicts = detectConflicts(existing, incoming);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].isoWeekKey).toBe('2026-W10');
  });
});
