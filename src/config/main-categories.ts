import type { MainCategoryId, WeeklyMainCategoryScores } from '../domain/models';

export type MainCategoryMeta = {
  id: MainCategoryId;
  label: string;
  iconKey: string;
  color: string;
  radarOrder: number;
};

export const mainCategories: readonly MainCategoryMeta[] = [
  { id: 'koerperlicheFunktion', label: 'Körperliche Funktion', iconKey: 'activity', color: '#22c55e', radarOrder: 0 },
  { id: 'mentalesWohlgefuehl', label: 'Mentales Wohlgefühl', iconKey: 'brain', color: '#a855f7', radarOrder: 1 },
  { id: 'sinngebung', label: 'Sinngebung', iconKey: 'compass', color: '#0ea5e9', radarOrder: 2 },
  { id: 'lebensqualitaet', label: 'Lebensqualität', iconKey: 'sparkles', color: '#f59e0b', radarOrder: 3 },
  { id: 'partizipation', label: 'Partizipation', iconKey: 'users', color: '#ef4444', radarOrder: 4 },
  { id: 'taeglichesLeben', label: 'Tägliches Leben', iconKey: 'calendar-check', color: '#14b8a6', radarOrder: 5 }
] as const;

export const defaultMainCategoryScore = 5;

export function createDefaultWeeklyMainCategoryScores(): WeeklyMainCategoryScores {
  return mainCategories.reduce(
    (scores, category) => ({ ...scores, [category.id]: defaultMainCategoryScore }),
    {} as WeeklyMainCategoryScores
  );
}
