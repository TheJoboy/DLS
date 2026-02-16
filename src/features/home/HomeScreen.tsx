import { useEffect, useMemo, useState } from 'react';
import { mainCategories } from '../../config/main-categories';
import { createDefaultWeeklyMainCategoryScores } from '../../config/main-categories';
import { getIsoWeekInfoWeeksAgo } from '../../domain/isoWeek';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';
import { RadarHealthChart } from './RadarHealthChart';

function calculateAverage(entry?: WeeklyEntry) {
  if (!entry) {
    return 0;
  }

  const values = mainCategories.map((category) => entry.mainCategoryScores[category.id]);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function HomeScreen() {
  const [weeksAgo, setWeeksAgo] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<WeeklyEntry | undefined>(undefined);
  const [previousEntry, setPreviousEntry] = useState<WeeklyEntry | undefined>(undefined);

  const selectedWeekInfo = useMemo(() => getIsoWeekInfoWeeksAgo(weeksAgo), [weeksAgo]);

  useEffect(() => {
    weeklyEntryStore.getByWeek(selectedWeekInfo.isoWeekKey).then((entry) => {
      setSelectedEntry(entry);
    });

    const previousWeek = getIsoWeekInfoWeeksAgo(weeksAgo + 1);
    weeklyEntryStore.getByWeek(previousWeek.isoWeekKey).then((entry) => {
      setPreviousEntry(entry);
    });
  }, [selectedWeekInfo.isoWeekKey, weeksAgo]);

  const average = useMemo(() => calculateAverage(selectedEntry), [selectedEntry]);
  const previousAverage = useMemo(() => calculateAverage(previousEntry), [previousEntry]);
  const trend = average - previousAverage;

  return (
    <section className="screen-stack">
      <div className="card">
        <h2>Startseite · {selectedWeekInfo.isoWeekKey}</h2>
        <p>
          {selectedWeekInfo.dateFrom} bis {selectedWeekInfo.dateTo}
        </p>

        <div className="field home-week-selector">
          <label htmlFor="home-week-range">Woche für Radar-Ansicht ({weeksAgo} Wochen zurück)</label>
          <input
            id="home-week-range"
            type="range"
            min={0}
            max={10}
            step={1}
            value={weeksAgo}
            onChange={(event) => setWeeksAgo(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="card">
        <h2>Wöchentliche Balance</h2>
        {!selectedEntry && <p>Kein Eintrag für diese Woche vorhanden.</p>}
        <RadarHealthChart values={selectedEntry?.mainCategoryScores ?? createDefaultWeeklyMainCategoryScores()} />
        <p>
          Durchschnittswert: <strong>{average.toFixed(1)} / 10</strong>
        </p>
        {previousEntry && (
          <p>
            Trend zur Vorwoche:{' '}
            <strong>
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)} Punkte
            </strong>
          </p>
        )}
      </div>
    </section>
  );
}
