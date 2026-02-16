import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getIsoWeekInfo } from '../../domain/isoWeek';
import { weeklyEntryStore } from '../../storage/db';

export function ThisWeekScreen() {
  const week = getIsoWeekInfo();
  const [status, setStatus] = useState<'none' | 'draft' | 'submitted'>('none');

  useEffect(() => {
    weeklyEntryStore.getByWeek(week.isoWeekKey).then((entry) => setStatus(entry?.status ?? 'none'));
  }, [week.isoWeekKey]);

  return (
    <section>
      <h2>Diese Woche ({week.isoWeekKey})</h2>
      <p>Status: <strong>{status === 'none' ? 'Kein Eintrag' : status === 'draft' ? 'Entwurf' : 'Abgeschickt'}</strong></p>
      <div className="actions">
        <Link className="button" to={`/checkin/${week.isoWeekKey}`}>{status === 'none' ? 'Check-in erstellen' : 'Check-in öffnen'}</Link>
        <Link className="button secondary" to="/analytics">Zur Auswertung</Link>
        <Link className="button secondary" to="/entries">Alle Protokolle</Link>
      </div>
    </section>
  );
}
