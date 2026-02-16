import { useEffect, useMemo, useState } from 'react';
import { mainCategories } from '../../config/main-categories';
import type { WeeklyEntry } from '../../domain/models';
import { weeklyEntryStore } from '../../storage/db';

const chartWidth = 760;
const chartHeight = 320;
const chartPadding = { top: 24, right: 20, bottom: 58, left: 40 };
const yMin = 0;
const yMax = 10;

export function AnalyticsScreen() {
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);

  useEffect(() => {
    weeklyEntryStore.getAll().then((allEntries) => {
      setEntries(allEntries.sort((a, b) => a.isoWeekKey.localeCompare(b.isoWeekKey)));
    });
  }, []);

  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const weekKeys = useMemo(() => entries.map((entry) => entry.isoWeekKey), [entries]);
  const yTicks = [0, 2, 4, 6, 8, 10];

  const xForIndex = (index: number) => chartPadding.left + ((plotWidth / Math.max(entries.length - 1, 1)) * index);
  const yForValue = (value: number) => chartPadding.top + (((yMax - value) / (yMax - yMin)) * plotHeight);

  return (
    <section>
      <h2>Auswertung</h2>
      {entries.length === 0 ? (
        <p>Keine Protokolle vorhanden.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="chart"
            role="img"
            aria-label="Liniendiagramm: x-Achse Kalenderwochen, y-Achse Bewertung 0 bis 10"
          >
            <line
              x1={chartPadding.left}
              y1={chartPadding.top}
              x2={chartPadding.left}
              y2={chartPadding.top + plotHeight}
              stroke="currentColor"
            />
            <line
              x1={chartPadding.left}
              y1={chartPadding.top + plotHeight}
              x2={chartPadding.left + plotWidth}
              y2={chartPadding.top + plotHeight}
              stroke="currentColor"
            />

            {yTicks.map((tick) => {
              const y = yForValue(tick);
              return (
                <g key={tick}>
                  <line
                    x1={chartPadding.left}
                    y1={y}
                    x2={chartPadding.left + plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                  />
                  <text x={chartPadding.left - 8} y={y + 4} textAnchor="end" fontSize="12">
                    {tick}
                  </text>
                </g>
              );
            })}

            {weekKeys.map((week, index) => (
              <text
                key={week}
                x={xForIndex(index)}
                y={chartPadding.top + plotHeight + 20}
                textAnchor="middle"
                fontSize="11"
                transform={entries.length > 10 ? `rotate(35 ${xForIndex(index)} ${chartPadding.top + plotHeight + 20})` : undefined}
              >
                {entries.length > 20 && index % 2 === 1 ? '' : week}
              </text>
            ))}

            {mainCategories.map((category) => {
              const points = entries.map((entry, index) => {
                const x = xForIndex(index);
                const y = yForValue(entry.mainCategoryScores[category.id]);
                return { x, y, week: entry.isoWeekKey, value: entry.mainCategoryScores[category.id] };
              });

              return (
                <g key={category.id}>
                  {points.map((point, index) => {
                    const previous = points[index - 1];
                    return (
                      <g key={`${category.id}-${point.week}`}>
                        {previous && (
                          <line
                            x1={previous.x}
                            y1={previous.y}
                            x2={point.x}
                            y2={point.y}
                            stroke={category.color}
                            strokeWidth="2"
                          />
                        )}
                        <circle cx={point.x} cy={point.y} r="3.5" fill={category.color}>
                          <title>{`${category.label} · ${point.week}: ${point.value}/10`}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <ul className="chart-legend" aria-label="Legende Kategorien">
            {mainCategories.map((category) => (
              <li key={category.id}>
                <span className="chart-legend-color" style={{ backgroundColor: category.color }} aria-hidden="true" />
                {category.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
