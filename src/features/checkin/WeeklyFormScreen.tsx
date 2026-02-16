import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { healthConfig } from '../../config/healthConfig';
import { weeklyEntryStore } from '../../storage/db';
import { useWeeklyEntry } from './useWeeklyEntry';
import { useDebounced } from './useDebounced';
import { useToast } from '../../app/toast';

export function WeeklyFormScreen() {
  const { isoWeekKey = '' } = useParams();
  const { entry, setEntry, loading } = useWeeklyEntry(isoWeekKey);
  const navigate = useNavigate();
  const saveInProgress = useRef(false);
  const toast = useToast();

  async function saveNow() {
    if (!entry || saveInProgress.current) return;
    saveInProgress.current = true;
    await weeklyEntryStore.upsert({ ...entry, updatedAt: new Date().toISOString() });
    toast.show('Gespeichert');
    saveInProgress.current = false;
  }

  useDebounced(() => { void saveNow(); }, [entry], 700);

  useEffect(() => {
    const onLeave = () => { void saveNow(); };
    window.addEventListener('beforeunload', onLeave);
    document.addEventListener('visibilitychange', onLeave);
    return () => {
      void saveNow();
      window.removeEventListener('beforeunload', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
    };
  });

  if (loading || !entry) return <p>Lade…</p>;

  return (
    <section>
      <header className="row">
        <h2>{entry.isoWeekKey}</h2>
        <span className={`badge ${entry.status}`}>{entry.status}</span>
        <button onClick={() => void saveNow()}>Speichern</button>
        <button onClick={async () => {
          if (window.confirm('Check-in wirklich abschicken?')) {
            await weeklyEntryStore.upsert({ ...entry, status: 'submitted', updatedAt: new Date().toISOString() });
            toast.show('Check-in abgeschlossen');
            navigate('/');
          }
        }}>Abschicken</button>
      </header>

      {healthConfig.dimensions.map((dimension) => (
        <details key={dimension.id} open>
          <summary>{dimension.label}</summary>
          {dimension.subcategories.map((sub) => (
            <div key={sub.id} className="field" onBlur={() => { void saveNow(); }}>
              <label htmlFor={sub.id}>{sub.label}: <strong>{entry.items[sub.id].score}</strong></label>
              <input
                id={sub.id}
                type="range"
                min={0}
                max={10}
                step={1}
                value={entry.items[sub.id].score}
                aria-label={`${dimension.label} ${sub.label} Wert`}
                onChange={(e) => setEntry((prev) => prev ? ({
                  ...prev,
                  items: { ...prev.items, [sub.id]: { ...prev.items[sub.id], score: Number(e.target.value) } }
                }) : prev)}
              />
              <textarea
                aria-label={`${dimension.label} ${sub.label} Notiz`}
                placeholder="Notiz"
                value={entry.items[sub.id].note}
                onChange={(e) => setEntry((prev) => prev ? ({
                  ...prev,
                  items: { ...prev.items, [sub.id]: { ...prev.items[sub.id], note: e.target.value } }
                }) : prev)}
              />
            </div>
          ))}
        </details>
      ))}
    </section>
  );
}
