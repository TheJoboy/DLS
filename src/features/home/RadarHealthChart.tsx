import { mainCategories } from '../../config/main-categories';
import type { WeeklyMainCategoryScores } from '../../domain/models';

type RadarHealthChartProps = {
  values: WeeklyMainCategoryScores;
};

const sortedCategories = [...mainCategories].sort((a, b) => a.radarOrder - b.radarOrder);
const maxScore = 10;
const levels = 5;
const size = 560;
const canvasPadding = 150;
const canvasSize = size + canvasPadding * 2;
const center = canvasSize / 2;
const radius = 175;
const labelRadius = 265;

const iconMap: Record<string, string> = {
  activity: '✚',
  brain: '◉',
  compass: '🧭',
  sparkles: '✦',
  users: '👥',
  'calendar-check': '✓'
};

function toPoint(index: number, distance: number) {
  const angle = (Math.PI * 2 * index) / sortedCategories.length - Math.PI / 2;
  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance
  };
}

export function RadarHealthChart({ values }: RadarHealthChartProps) {
  const levelPolygons = Array.from({ length: levels }, (_, i) => {
    const levelRadius = (radius * (i + 1)) / levels;
    return sortedCategories.map((_, index) => {
      const point = toPoint(index, levelRadius);
      return `${point.x},${point.y}`;
    }).join(' ');
  });

  const dataPolygon = sortedCategories.map((category, index) => {
    const normalizedScore = Math.max(0, Math.min(maxScore, values[category.id]));
    const point = toPoint(index, (normalizedScore / maxScore) * radius);
    return `${point.x},${point.y}`;
  }).join(' ');

  return (
    <figure className="radar-card">
      <svg viewBox={`0 0 ${canvasSize} ${canvasSize}`} className="radar-chart" role="img" aria-label="Radar-Diagramm der Gesundheitskategorien">
        <g>
          {levelPolygons.map((points, index) => (
            <polygon key={`level-${index}`} points={points} fill="none" stroke="#d1d5db" strokeWidth="1" />
          ))}

          {sortedCategories.map((category, index) => {
            const axisEnd = toPoint(index, radius);
            return (
              <line
                key={`${category.id}-axis`}
                x1={center}
                y1={center}
                x2={axisEnd.x}
                y2={axisEnd.y}
                stroke="#9ca3af"
                strokeWidth="1"
              />
            );
          })}

          {[0, 2, 4, 6, 8, 10].map((tick) => {
            const y = center - (tick / maxScore) * radius;
            return (
              <text key={tick} x={center + 8} y={y - 3} fontSize="10" fill="#6b7280">
                {tick}
              </text>
            );
          })}

          <polygon points={dataPolygon} fill="#2563eb44" stroke="#2563eb" strokeWidth="2" />

          {sortedCategories.map((category, index) => {
            const labelPoint = toPoint(index, labelRadius);
            const iconPoint = toPoint(index, labelRadius - 24);
            return (
              <g key={`${category.id}-label`}>
                <circle cx={iconPoint.x} cy={iconPoint.y} r="14" fill={category.color} />
                <text x={iconPoint.x} y={iconPoint.y + 4} textAnchor="middle" fontSize="12" fill="#fff">
                  {iconMap[category.iconKey] ?? '•'}
                </text>
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={labelPoint.x < center - 10 ? 'end' : labelPoint.x > center + 10 ? 'start' : 'middle'}
                  fontSize="12"
                  fontWeight="600"
                  fill="#111827"
                >
                  {`${category.label} (${values[category.id]}/10)`}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
  );
}
