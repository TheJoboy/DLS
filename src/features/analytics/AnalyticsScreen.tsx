import { useEffect, useMemo, useState } from 'react';
import { healthConfig } from '../../config/healthConfig';
import { buildSeries, getStats } from '../../domain/analytics';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

function filterEntries(entries: WeeklyEntry[], range: string, includeDrafts: boolean) {
  const now = new Date();
  const sorted = [...entries].filter((e) => includeDrafts || e.status === 'submitted');
  if (range === 'all') return sorted;
  if (range === 'year') return sorted.filter((e) => e.year === now.getFullYear());
  const n = Number(range);
  return sorted.slice(0, n);
}

export function AnalyticsScreen() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [mode, setMode] = useState<'subcategory' | 'dimension'>('subcategory');
  const [range, setRange] = useState('12');
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [targetId, setTargetId] = useState(healthConfig.dimensions[0].subcategories[0].id);

  useEffect(() => { weeklyEntryStore.getAll().then(setEntries); }, []);

  const options = mode === 'subcategory'
    ? healthConfig.dimensions.flatMap((d) => d.subcategories.map((s) => ({ id: s.id, label: `${d.label}: ${s.label}` })))
    : healthConfig.dimensions.map((d) => ({ id: d.id, label: d.label }));

  useEffect(() => { setTargetId(options[0].id); }, [mode]);

  const filtered = useMemo(() => filterEntries(entries, range, includeDrafts), [entries, includeDrafts, range]);
  const series = useMemo(() => buildSeries(filtered, healthConfig, mode, targetId), [filtered, mode, targetId]);
  const stats = getStats(series.map((s) => s.value));

  const width = 700; const height = 240;

  return (
    <section>
      <h2>Auswertung</h2>
      <div className="row">
        <label>Modus <select value={mode} onChange={(e) => setMode(e.target.value as 'subcategory' | 'dimension')}><option value="subcategory">Unterkategorie</option><option value="dimension">Dimension (Ø)</option></select></label>
        <label>Ziel <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>{options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
        <label>Zeitraum <select value={range} onChange={(e) => setRange(e.target.value)}><option value="8">8 Wochen</option><option value="12">12 Wochen</option><option value="year">Jahr</option><option value="all">Alles</option></select></label>
        <label><input type="checkbox" checked={includeDrafts} onChange={(e) => setIncludeDrafts(e.target.checked)} /> Drafts anzeigen</label>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label="Liniendiagramm von 0 bis 10 über Kalenderwochen">
        <line x1="30" y1="20" x2="30" y2="210" stroke="currentColor" />
        <line x1="30" y1="210" x2="680" y2="210" stroke="currentColor" />
        {series.map((point, i) => {
          const x = 30 + ((650 / Math.max(series.length - 1, 1)) * i);
          const y = 210 - ((point.value ?? 0) / 10) * 190;
          const prev = series[i - 1];
          const prevX = 30 + ((650 / Math.max(series.length - 1, 1)) * (i - 1));
          const prevY = 210 - (((prev?.value ?? 0)) / 10) * 190;
          return (
            <g key={point.week}>
              {i > 0 && <line x1={prevX} y1={prevY} x2={x} y2={y} stroke="#2563eb" />}
              <circle cx={x} cy={y} r="4" fill="#2563eb">
                <title>{`${point.week}: ${point.value} ${point.note ? `| ${point.note}` : ''}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      <p>Min: {stats.min} · Max: {stats.max} · Ø: {stats.avg} · Trend: {stats.trend >= 0 ? '+' : ''}{stats.trend}</p>
    </section>
  );
}
