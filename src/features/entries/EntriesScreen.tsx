import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mainCategories } from '../../config/main-categories';
import { avg } from '../../domain/analytics';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

export function EntriesScreen() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  async function refresh() { setEntries(await weeklyEntryStore.getAll()); }
  useEffect(() => { void refresh(); }, []);

  return (
    <section>
      <h2>Protokolle</h2>
      <p>
        <Link className="button" to="/protokoll">Neues Protokoll</Link>
      </p>
      {entries.length === 0 && <p>Noch keine Protokolle vorhanden.</p>}
      <ul>
        {entries.map((entry) => {
          const categoryValues = mainCategories.map((category) => ({
            id: category.id,
            label: category.label,
            value: entry.mainCategoryScores[category.id]
          }));
          return (
            <li key={entry.isoWeekKey} className="row">
              <span>{entry.isoWeekKey}</span>
              <span className={`badge ${entry.status}`}>{entry.status}</span>
              <span>Ø {avg(categoryValues.map((category) => category.value))}</span>
              <div className="row category-values-inline">
                {categoryValues.map((category) => (
                  <span key={category.id} className="mini-pill">{category.label}: {category.value}</span>
                ))}
              </div>
              <Link className="button secondary" to={`/checkin/${entry.isoWeekKey}`}>Bearbeiten</Link>
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
