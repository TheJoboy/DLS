import { createDefaultWeeklyMainCategoryScores } from '../config/main-categories';

export type EntryStatus = 'draft' | 'submitted';

export type MainCategoryId =
  | 'koerperlicheFunktion'
  | 'mentalesWohlgefuehl'
  | 'sinngebung'
  | 'lebensqualitaet'
  | 'partizipation'
  | 'taeglichesLeben';

export type WeeklyMainCategoryScores = Record<MainCategoryId, number>;

export type WeeklyItem = { score: number; note: string };

export type WeeklyEntry = {
  isoWeekKey: string;
  year: number;
  week: number;
  dateFrom: string;
  dateTo: string;
  status: EntryStatus;
  items: Record<string, WeeklyItem>;
  mainCategoryScores: WeeklyMainCategoryScores;
  protocolNote: string;
  updatedAt: string;
};

export function normalizeWeeklyEntry(entry: WeeklyEntry | (Omit<WeeklyEntry, 'mainCategoryScores' | 'protocolNote'> & { mainCategoryScores?: WeeklyMainCategoryScores; protocolNote?: string; })): WeeklyEntry {
  return {
    ...entry,
    mainCategoryScores: entry.mainCategoryScores ?? createDefaultWeeklyMainCategoryScores(),
    protocolNote: entry.protocolNote ?? ''
  };
}

export type ImportConflict = { isoWeekKey: string; existing: WeeklyEntry; incoming: WeeklyEntry };
