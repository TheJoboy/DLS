import { Link } from 'react-router-dom';

export function HomeScreen() {
  return (
    <section>
      <h2>Startseite</h2>
      <p>Wähle aus, was du als Nächstes machen möchtest.</p>
      <nav aria-label="Schnellzugriffe" className="actions">
        <Link className="button" to="/protokoll-anlegen">Protokoll anlegen</Link>
        <Link className="button secondary" to="/entries">Protokolle</Link>
        <Link className="button secondary" to="/erweiterte-auswertung">Erweiterte Auswertung</Link>
        <Link className="button secondary" to="/settings">Einstellungen</Link>
      </nav>
    </section>
  );
}
