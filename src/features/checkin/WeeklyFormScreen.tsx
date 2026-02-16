import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mainCategories } from '../../config/main-categories';
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

      <div className="field card" onBlur={() => { void saveNow(); }}>
        <label htmlFor="protocol-note">Notiz zum Protokoll</label>
        <textarea
          id="protocol-note"
          value={entry.protocolNote}
          onChange={(e) => setEntry((prev) => prev ? ({
            ...prev,
            protocolNote: e.target.value
          }) : prev)}
          rows={4}
          placeholder="Zusätzliche Notizen zum Protokoll"
        />
      </div>

      <div className="main-category-form-grid">
        {mainCategories.map((category) => (
          <div key={category.id} className="field card" onBlur={() => { void saveNow(); }}>
            <label htmlFor={category.id}>{category.label}: <strong>{entry.mainCategoryScores[category.id]}</strong></label>
            <input
              id={category.id}
              type="range"
              min={0}
              max={10}
              step={1}
              value={entry.mainCategoryScores[category.id]}
              aria-label={`${category.label} Wert`}
              onChange={(e) => setEntry((prev) => prev ? ({
                ...prev,
                mainCategoryScores: {
                  ...prev.mainCategoryScores,
                  [category.id]: Number(e.target.value)
                }
              }) : prev)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
