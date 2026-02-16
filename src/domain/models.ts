export type EntryStatus = 'draft' | 'submitted';

export type WeeklyItem = { score: number; note: string };

export type WeeklyEntry = {
  isoWeekKey: string;
  year: number;
  week: number;
  dateFrom: string;
  dateTo: string;
  status: EntryStatus;
  items: Record<string, WeeklyItem>;
  updatedAt: string;
};

export type ImportConflict = { isoWeekKey: string; existing: WeeklyEntry; incoming: WeeklyEntry };
