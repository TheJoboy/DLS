import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIsoWeekInfoWeeksAgo } from '../../domain/isoWeek';

export function CreateProtocolScreen() {
  const navigate = useNavigate();
  const currentWeek = getIsoWeekInfoWeeksAgo(0).isoWeekKey;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const weekOptions = useMemo(
    () => Array.from({ length: 53 }, (_, index) => getIsoWeekInfoWeeksAgo(index)),
    []
  );

  return (
    <section>
      <h2>Protokoll anlegen</h2>
      <p>Wähle die Kalenderwoche aus. Standardmäßig ist die aktuelle Woche vorausgewählt.</p>
      <div className="field protocol-week-picker">
        <label htmlFor="protocol-week">Kalenderwoche</label>
        <select
          id="protocol-week"
          value={selectedWeek}
          onChange={(event) => setSelectedWeek(event.target.value)}
        >
          {weekOptions.map((week) => (
            <option key={week.isoWeekKey} value={week.isoWeekKey}>
              {week.isoWeekKey} ({week.dateFrom} bis {week.dateTo})
            </option>
          ))}
        </select>
      </div>
      <button onClick={() => navigate(`/checkin/${selectedWeek}`)}>Protokoll öffnen</button>
    </section>
  );
}
