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
  updatedAt: string;
};

export function normalizeWeeklyEntry(entry: WeeklyEntry | (Omit<WeeklyEntry, 'mainCategoryScores'> & { mainCategoryScores?: WeeklyMainCategoryScores; })): WeeklyEntry {
  return {
    ...entry,
    mainCategoryScores: entry.mainCategoryScores ?? createDefaultWeeklyMainCategoryScores()
  };
}

export type ImportConflict = { isoWeekKey: string; existing: WeeklyEntry; incoming: WeeklyEntry };
