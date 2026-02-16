import { useEffect, useMemo, useState } from 'react';
import { createDefaultWeeklyMainCategoryScores } from '../../config/main-categories';
import { getIsoWeekInfoWeeksAgo } from '../../domain/isoWeek';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';
import { RadarHealthChart } from './RadarHealthChart';

export function HomeScreen() {
  const [weeksAgo, setWeeksAgo] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<WeeklyEntry | undefined>(undefined);

  const selectedWeekInfo = useMemo(() => getIsoWeekInfoWeeksAgo(weeksAgo), [weeksAgo]);

  useEffect(() => {
    weeklyEntryStore.getByWeek(selectedWeekInfo.isoWeekKey).then((entry) => {
      setSelectedEntry(entry);
    });
  }, [selectedWeekInfo.isoWeekKey]);

  return (
    <section>
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

      {!selectedEntry && <p>Kein Eintrag für diese Woche vorhanden.</p>}

      <RadarHealthChart values={selectedEntry?.mainCategoryScores ?? createDefaultWeeklyMainCategoryScores()} />
    </section>
  );
}
