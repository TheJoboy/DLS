import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createDefaultWeeklyMainCategoryScores } from '../../config/main-categories';
import { getIsoWeekInfo } from '../../domain/isoWeek';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';
import { RadarHealthChart } from './RadarHealthChart';

export function HomeScreen() {
  const currentWeek = getIsoWeekInfo().isoWeekKey;
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    weeklyEntryStore.getAll().then((allEntries) => {
      setEntries(allEntries);
      const hasCurrentWeek = allEntries.some((entry) => entry.isoWeekKey === currentWeek);
      if (!hasCurrentWeek && allEntries.length > 0) {
        setSelectedWeek(allEntries[0].isoWeekKey);
      }
    });
  }, [currentWeek]);

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.isoWeekKey === selectedWeek),
    [entries, selectedWeek]
  );

  return (
    <section>
      <h2>Startseite</h2>
      <p>Wähle aus, was du als Nächstes machen möchtest.</p>
      <nav aria-label="Schnellzugriffe" className="actions">
        <Link className="button" to="/protokoll-anlegen">Protokoll anlegen</Link>
        <Link className="button secondary" to="/entries">Protokolle</Link>
        <Link className="button secondary" to="/erweiterte-auswertung">Erweiterte Auswertung</Link>
        <Link className="button secondary" to="/settings">Einstellungen</Link>
      </nav>

      <div className="field home-week-selector">
        <label htmlFor="home-week">Woche für Radar-Ansicht</label>
        <select
          id="home-week"
          value={selectedWeek}
          onChange={(event) => setSelectedWeek(event.target.value)}
        >
          {entries.map((entry) => (
            <option key={entry.isoWeekKey} value={entry.isoWeekKey}>
              {entry.isoWeekKey}
            </option>
          ))}
          {!entries.some((entry) => entry.isoWeekKey === currentWeek) && (
            <option value={currentWeek}>{currentWeek} (aktuelle Woche, ohne Eintrag)</option>
          )}
        </select>
      </div>

      <RadarHealthChart values={selectedEntry?.mainCategoryScores ?? createDefaultWeeklyMainCategoryScores()} />
    </section>
  );
}
