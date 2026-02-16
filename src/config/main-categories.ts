import type { MainCategoryId, WeeklyMainCategoryScores } from '../domain/models';

export type MainCategoryMeta = {
  id: MainCategoryId;
  label: string;
  iconKey: string;
  color: string;
  radarOrder: number;
};

export const mainCategories: readonly MainCategoryMeta[] = [
  { id: 'koerperlicheFunktion', label: 'Körperliche Funktionen', iconKey: 'activity', color: '#e40046', radarOrder: 0 },
  { id: 'mentalesWohlgefuehl', label: 'Mentales Wohlgefühl', iconKey: 'brain', color: '#00a3e0', radarOrder: 1 },
  { id: 'sinngebung', label: 'Sinngebung', iconKey: 'compass', color: '#8a3fa0', radarOrder: 2 },
  { id: 'lebensqualitaet', label: 'Lebensqualität', iconKey: 'sparkles', color: '#f4a300', radarOrder: 3 },
  { id: 'partizipation', label: 'Partizipation', iconKey: 'users', color: '#ef7d00', radarOrder: 4 },
  { id: 'taeglichesLeben', label: 'Tägliches Leben', iconKey: 'calendar-check', color: '#80ba27', radarOrder: 5 }
] as const;

export const defaultMainCategoryScore = 5;

export function createDefaultWeeklyMainCategoryScores(): WeeklyMainCategoryScores {
  return mainCategories.reduce(
    (scores, category) => ({ ...scores, [category.id]: defaultMainCategoryScore }),
    {} as WeeklyMainCategoryScores
  );
}
