import { useEffect, useMemo, useState } from 'react';
import { mainCategories } from '../../config/main-categories';
import { avg, getStats } from '../../domain/analytics';
import type { MainCategoryId, WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

function filterEntries(entries: WeeklyEntry[], range: string, includeDrafts: boolean) {
  const now = new Date();
  const sorted = [...entries].filter((entry) => includeDrafts || entry.status === 'submitted');
  if (range === 'all') return sorted;
  if (range === 'year') return sorted.filter((entry) => entry.year === now.getFullYear());
  const n = Number(range);
  return sorted.slice(0, n);
}

export function AnalyticsScreen() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [range, setRange] = useState('12');
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [targetId, setTargetId] = useState<MainCategoryId>(mainCategories[0].id);

  useEffect(() => { weeklyEntryStore.getAll().then(setEntries); }, []);

  const filtered = useMemo(() => filterEntries(entries, range, includeDrafts), [entries, includeDrafts, range]);
  const series = useMemo(() => (
    [...filtered]
      .sort((a, b) => a.isoWeekKey.localeCompare(b.isoWeekKey))
      .map((entry) => ({ week: entry.isoWeekKey, value: entry.mainCategoryScores[targetId] }))
  ), [filtered, targetId]);
  const stats = getStats(series.map((point) => point.value));
  const weekAverage = avg(filtered.map((entry) => avg(Object.values(entry.mainCategoryScores))));

  const width = 700;
  const height = 240;

  return (
    <section>
      <h2>Auswertung</h2>
      <div className="row">
        <label>
          Kategorie
          <select value={targetId} onChange={(e) => setTargetId(e.target.value as MainCategoryId)}>
            {mainCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </label>
        <label>
          Zeitraum
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="8">8 Wochen</option>
            <option value="12">12 Wochen</option>
            <option value="year">Jahr</option>
            <option value="all">Alles</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={includeDrafts} onChange={(e) => setIncludeDrafts(e.target.checked)} /> Drafts anzeigen
        </label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label="Liniendiagramm von 0 bis 10 über Kalenderwochen">
        <line x1="30" y1="20" x2="30" y2="210" stroke="currentColor" />
        <line x1="30" y1="210" x2="680" y2="210" stroke="currentColor" />
        {series.map((point, i) => {
          const x = 30 + ((650 / Math.max(series.length - 1, 1)) * i);
          const y = 210 - (point.value / 10) * 190;
          const prev = series[i - 1];
          const prevX = 30 + ((650 / Math.max(series.length - 1, 1)) * (i - 1));
          const prevY = 210 - (((prev?.value ?? 0) / 10) * 190);
          return (
            <g key={point.week}>
              {i > 0 && <line x1={prevX} y1={prevY} x2={x} y2={y} stroke="#2563eb" />}
              <circle cx={x} cy={y} r="4" fill="#2563eb">
                <title>{`${point.week}: ${point.value}/10`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <p>Min: {stats.min} · Max: {stats.max} · Ø Kategorie: {stats.avg} · Trend: {stats.trend >= 0 ? '+' : ''}{stats.trend}</p>
      <p>Ø Gesamt pro Woche (über alle 6 Kategorien): {weekAverage}</p>
    </section>
  );
}
