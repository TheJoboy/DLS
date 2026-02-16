import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { healthConfig } from '../../config/healthConfig';
import { getDimensionAverage, avg } from '../../domain/analytics';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

export function EntriesScreen() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  async function refresh() { setEntries(await weeklyEntryStore.getAll()); }
  useEffect(() => { void refresh(); }, []);

  return (
    <section>
      <h2>Protokolle</h2>
      <ul>
        {entries.map((entry) => {
          const means = healthConfig.dimensions.map((d) => getDimensionAverage(entry, d.id, healthConfig)).filter((v): v is number => v !== null);
          return (
            <li key={entry.isoWeekKey} className="row">
              <span>{entry.isoWeekKey}</span>
              <span className={`badge ${entry.status}`}>{entry.status}</span>
              <span>Ø {avg(means)}</span>
              <Link to={`/checkin/${entry.isoWeekKey}`}>Öffnen</Link>
              <button onClick={async () => {
                if (window.confirm(`Eintrag ${entry.isoWeekKey} löschen?`)) {
                  await weeklyEntryStore.delete(entry.isoWeekKey);
                  await refresh();
                }
              }}>Löschen</button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
