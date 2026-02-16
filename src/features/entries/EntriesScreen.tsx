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
    <section className="screen-stack">
      <div className="card">
        <h2>Protokolle</h2>
        <Link className="button" to="/protokoll">Neues Protokoll</Link>
      </div>

      {entries.length === 0 && (
        <div className="card">
          <p>Noch keine Protokolle vorhanden.</p>
        </div>
      )}

      <ul className="list-reset">
        {entries.map((entry) => {
          const categoryValues = mainCategories.map((category) => ({
            id: category.id,
            label: category.label,
            value: entry.mainCategoryScores[category.id]
          }));
          return (
            <li key={entry.isoWeekKey} className="card">
              <div className="row">
                <strong>{entry.isoWeekKey}</strong>
                <span className={`badge ${entry.status}`}>{entry.status}</span>
                <span className="secondary-text">Ø {avg(categoryValues.map((category) => category.value))}</span>
              </div>
              <div className="row category-values-inline">
                {categoryValues.map((category) => (
                  <span key={category.id} className="mini-pill">{category.label}: {category.value}</span>
                ))}
              </div>
              <div className="actions">
                <Link className="button outline" to={`/checkin/${entry.isoWeekKey}`}>Bearbeiten</Link>
                <button
                  className="danger"
                  onClick={async () => {
                    if (window.confirm(`Eintrag ${entry.isoWeekKey} löschen?`)) {
                      await weeklyEntryStore.delete(entry.isoWeekKey);
                      await refresh();
                    }
                  }}
                >
                  Löschen
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
